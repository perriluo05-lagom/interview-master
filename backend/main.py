from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Optional, Literal
import os
import json
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Agent Interviewer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载前端静态文件
BASE_DIR = Path(__file__).resolve().parent.parent
DIST_DIR = BASE_DIR / "dist"
if DIST_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="assets")

    @app.get("/")
    async def serve_index():
        return FileResponse(str(DIST_DIR / "index.html"))

# 支持的API提供商配置
PROVIDERS = {
    "openai": {
        "base_url": "https://api.openai.com/v1",
        "models": ["gpt-4o", "gpt-4", "gpt-3.5-turbo"]
    },
    "agnes": {
        "base_url": "https://apihub.agnes-ai.com/v1",
        "models": ["agnes-2.0-flash"]
    },
    "deepseek": {
        "base_url": "https://api.deepseek.com",
        "models": ["deepseek-chat", "deepseek-coder"]
    },
    "qwen": {
        "base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1",
        "models": ["qwen-turbo", "qwen-plus", "qwen-max"]
    },
    "kimi": {
        "base_url": "https://api.moonshot.cn/v1",
        "models": ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"]
    },
    "groq": {
        "base_url": "https://api.groq.com/openai/v1",
        "models": ["llama-3.1-70b-versatile", "mixtral-8x7b-32768", "gemma2-9b-it"]
    },
    "together": {
        "base_url": "https://api.together.xyz/v1",
        "models": ["meta-llama/Llama-3.1-70B-Instruct-Turbo", "deepseek-ai/DeepSeek-V3"]
    },
    "openrouter": {
        "base_url": "https://openrouter.ai/api/v1",
        "models": ["openai/gpt-4o", "anthropic/claude-3.5-sonnet"]
    },
    "custom": {
        "base_url": None,
        "models": ["custom-model"]
    }
}

class AnalysisRequest(BaseModel):
    jd: str
    resume: Optional[str] = None
    supplementary: Optional[str] = None
    career_plan: Optional[str] = None
    api_key: Optional[str] = None
    model: Optional[str] = "gpt-4o"
    provider: Optional[str] = "openai"
    custom_base_url: Optional[str] = None

class CompanyAnalysis(BaseModel):
    company_name: str
    industry: str
    description: str
    culture: list[str]
    values: str
    mission: str = "未找到公开信息"
    vision: str = "未找到公开信息"
    data_source: str = "基于JD内容分析"

class JobAnalysis(BaseModel):
    position: str
    department: str
    location: str
    salary: str
    job_description: str
    requirements: list[str]
    match_score: int
    match_analysis: str

class InterviewQuestion(BaseModel):
    id: int
    question: str
    category: str
    difficulty: str
    suggestion: str
    order: int = 1

class AnalysisResponse(BaseModel):
    company_analysis: CompanyAnalysis
    job_analysis: JobAnalysis
    interview_questions: list[InterviewQuestion]
    source: str = "mock"

class ProviderInfo(BaseModel):
    name: str
    display_name: str
    base_url: Optional[str]
    models: list[str]

def get_base_url(provider: str, custom_base_url: Optional[str] = None) -> Optional[str]:
    if provider == "custom" and custom_base_url:
        return custom_base_url
    return PROVIDERS.get(provider, {}).get("base_url")

def analyze_with_llm(request: AnalysisRequest):
    try:
        from openai import OpenAI
        import json
        
        api_key = request.api_key or os.getenv("OPENAI_API_KEY")
        
        if not api_key:
            return None
        
        base_url = get_base_url(request.provider, request.custom_base_url)
        if not base_url:
            print("无效的API提供商或未提供自定义Base URL")
            return None
        
        client = OpenAI(api_key=api_key, base_url=base_url)
        
        prompt = f"""
你是一位专业的AI面试顾问。请根据以下岗位JD和用户信息，完成以下任务：

【岗位JD】
{request.jd}

【用户简历（可选）】
{request.resume or '未提供'}

【补充材料（可选）】
{request.supplementary or '未提供'}

【职业规划（可选）】
{request.career_plan or '未提供'}

请按照以下JSON格式输出结果：
{{
  "company_analysis": {{
    "company_name": "从JD中提取或推测的公司名称",
    "industry": "公司所属行业",
    "description": "公司基本介绍（基于公开信息和JD内容，简洁概括）",
    "culture": ["企业文化关键词1", "企业文化关键词2", "企业文化关键词3"],
    "values": "公司核心价值观（必须基于官网或权威渠道的真实信息，如果找不到请直接填写'未找到公开信息'，严禁编造）",
    "mission": "公司使命（从官网或公开渠道获取，找不到请填写'未找到公开信息'，严禁编造）",
    "vision": "公司愿景（从官网或公开渠道获取，找不到请填写'未找到公开信息'，严禁编造）",
    "data_source": "信息来源说明（如：官网、企查查、天眼查等；如果信息不充分请说明'基于JD内容推断，建议进一步查阅官网'）"
  }},
  "job_analysis": {{
    "position": "岗位名称",
    "department": "所属部门",
    "location": "工作地点",
    "salary": "薪资范围（根据市场行情推断）",
    "job_description": "岗位职责总结",
    "requirements": ["任职要求1", "任职要求2", "任职要求3"],
    "match_score": 0-100之间的匹配度分数,
    "match_analysis": "详细的匹配度分析"
  }},
  "interview_questions": [
    {{
      "id": 1,
      "question": "预测的面试问题",
      "category": "面试板块（必须是以下之一：自我介绍、岗位专业知识、简历深挖、项目经验、职业规划、行为面试、反问环节）",
      "difficulty": "难度（简单/中等/困难）",
      "suggestion": "完整的参考回答（不是简单的建议，而是一个可以直接使用的完整回答示例，至少150字，结合用户背景）",
      "order": 1
    }}
  ]
}}

重要要求：
1. 【公司信息】重点分析企业文化和核心理念，必须基于官方或权威渠道的真实信息，找不到就直接说明'未找到公开信息'，绝对不要编造
2. 【面试问题顺序】必须按照一般面试的真实先后顺序排列，order字段从1开始递增
3. 【面试板块覆盖】必须包含以下板块，每个板块至少1-2个问题：
   - 自我介绍（order 1）
   - 岗位专业知识（order 2-3）
   - 简历深挖（order 4-5，针对简历中的项目或经历提问）
   - 项目经验（order 6-7）
   - 职业规划（order 8）
   - 行为面试（order 9）
   - 反问环节（order 10，给面试官提问的建议）
4. 【问题来源】可参考小红书、牛客网、脉脉等社媒的经验贴和面经，结合JD特质和简历内容合理推测
5. 【回答建议】必须是完整的参考回答，可以直接使用，而不是'建议使用STAR法则'这种空泛建议
6. 确保JSON格式正确，没有多余的Markdown标记
"""
        
        response = client.chat.completions.create(
            model=request.model,
            messages=[
                {"role": "system", "content": "你是一位专业的AI面试顾问，擅长分析岗位需求、评估匹配度和预测面试问题。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        result["source"] = "llm"
        return result
        
    except Exception as e:
        print(f"LLM分析失败，使用模拟数据: {str(e)}")
        return None

@app.get("/")
async def root():
    return {"message": "Agent Interviewer API"}

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

@app.get("/api/providers")
async def get_providers():
    """获取所有支持的API提供商列表"""
    return {
        "providers": [
            {"name": "openai", "display_name": "OpenAI", "base_url": PROVIDERS["openai"]["base_url"], "models": PROVIDERS["openai"]["models"]},
            {"name": "agnes", "display_name": "Agnes AI (免费)", "base_url": PROVIDERS["agnes"]["base_url"], "models": PROVIDERS["agnes"]["models"]},
            {"name": "deepseek", "display_name": "DeepSeek", "base_url": PROVIDERS["deepseek"]["base_url"], "models": PROVIDERS["deepseek"]["models"]},
            {"name": "qwen", "display_name": "通义千问", "base_url": PROVIDERS["qwen"]["base_url"], "models": PROVIDERS["qwen"]["models"]},
            {"name": "kimi", "display_name": "Kimi", "base_url": PROVIDERS["kimi"]["base_url"], "models": PROVIDERS["kimi"]["models"]},
            {"name": "groq", "display_name": "Groq (快速)", "base_url": PROVIDERS["groq"]["base_url"], "models": PROVIDERS["groq"]["models"]},
            {"name": "together", "display_name": "Together AI", "base_url": PROVIDERS["together"]["base_url"], "models": PROVIDERS["together"]["models"]},
            {"name": "openrouter", "display_name": "OpenRouter", "base_url": PROVIDERS["openrouter"]["base_url"], "models": PROVIDERS["openrouter"]["models"]},
            {"name": "custom", "display_name": "自定义", "base_url": None, "models": ["custom-model"]}
        ]
    }

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze(request: AnalysisRequest):
    if not request.jd.strip():
        raise HTTPException(status_code=400, detail="岗位JD不能为空")
    
    if request.api_key or os.getenv("OPENAI_API_KEY"):
        llm_result = analyze_with_llm(request)
        if llm_result:
            return llm_result
    
    mock_response = {
        "company_analysis": {
            "company_name": "从JD分析的公司",
            "industry": "互联网/科技",
            "description": "根据岗位JD分析，这是一家科技公司，注重创新和技术发展。",
            "culture": ["创新", "团队合作", "客户至上"],
            "values": "未找到公开信息（演示模式，配置API Key后将从权威渠道获取真实信息）",
            "mission": "未找到公开信息（演示模式）",
            "vision": "未找到公开信息（演示模式）",
            "data_source": "基于JD内容推断，建议配置API Key获取权威渠道真实信息"
        },
        "job_analysis": {
            "position": "从JD提取的岗位名称",
            "department": "技术部",
            "location": "未知",
            "salary": "根据市场行情推断",
            "job_description": request.jd[:200] + "..." if len(request.jd) > 200 else request.jd,
            "requirements": ["具备相关技术能力", "良好的沟通能力", "团队协作精神"],
            "match_score": 75,
            "match_analysis": "基于您提供的信息，您的背景与该岗位有一定匹配度。建议重点准备技术面试，突出相关项目经验。"
        },
        "interview_questions": [
            {
                "id": 1,
                "question": "请做一个简单的自我介绍",
                "category": "自我介绍",
                "difficulty": "简单",
                "suggestion": "面试官您好，我叫XXX，毕业于XX大学XX专业。过去X年我一直在XX领域工作，主要负责XX方向。在上一段经历中，我主导了XX项目，通过XX方法解决了XX问题，最终实现了XX成果。我关注到贵公司正在招聘XX岗位，这与我的职业发展方向高度契合，希望能有机会加入团队，发挥我的专业能力。",
                "order": 1
            },
            {
                "id": 2,
                "question": "请介绍一下你对这个岗位的理解，以及你具备哪些核心能力？",
                "category": "岗位专业知识",
                "difficulty": "中等",
                "suggestion": "根据我对JD的理解，这个岗位主要负责XX工作，核心要求包括XX、XX和XX能力。我具备X年相关经验，在XX技术/工具方面有深入实践。比如在上一份工作中，我使用XX完成了XX任务，提升了XX指标。我认为我的XX能力和XX经验能够很好地胜任这个岗位的要求。",
                "order": 2
            },
            {
                "id": 3,
                "question": "你在简历中提到的XX项目，能详细讲讲吗？",
                "category": "简历深挖",
                "difficulty": "中等",
                "suggestion": "这个项目是我在XX公司期间主导的，背景是XX业务面临XX挑战。我的角色是XX，主要负责XX。在技术方案上，我选择了XX方案，因为XX。过程中遇到了XX困难，我通过XX方法解决。最终项目交付了XX成果，数据指标提升了XX%。这个经历让我深刻理解了XX的重要性。",
                "order": 3
            },
            {
                "id": 4,
                "question": "描述一个你遇到的技术难题及解决过程",
                "category": "项目经验",
                "difficulty": "困难",
                "suggestion": "在XX项目中，我们遇到了XX技术难题，具体表现为XX。我首先通过XX方式分析问题根因，发现是XX导致的。然后我调研了XX、XX等几种方案，最终选择了XX方案，因为XX。实施过程中，我编写了XX代码/设计了XX架构，并通过XX测试验证。最终问题得到解决，系统性能提升了XX%。这个经历锻炼了我XX能力。",
                "order": 4
            },
            {
                "id": 5,
                "question": "你未来3-5年的职业规划是什么？",
                "category": "职业规划",
                "difficulty": "中等",
                "suggestion": "我的职业规划分为三个阶段。短期（1年内）：快速融入团队，掌握XX技术栈，独立承担XX模块开发。中期（2-3年）：在XX领域深入钻研，成为团队的技术骨干，能够带领小组完成XX级别的项目。长期（3-5年）：向XX方向发展（技术专家/管理岗），主导XX方向的技术决策，为公司的XX业务贡献价值。贵公司的XX方向与我的规划高度契合。",
                "order": 5
            },
            {
                "id": 6,
                "question": "讲述一次你在团队中处理冲突的经历",
                "category": "行为面试",
                "difficulty": "中等",
                "suggestion": "在XX项目中，我和XX同事在技术方案上产生了分歧，他主张XX方案，我倾向XX方案。我没有直接否定他，而是约他一起梳理需求，列出两个方案的优缺点对比表。通过客观分析数据，我们发现XX方案在XX方面更优。最终他认可了我的方案，我也采纳了他XX的建议。这次经历让我学会了用数据和逻辑解决分歧，而不是情绪化对抗。",
                "order": 6
            },
            {
                "id": 7,
                "question": "你有什么想问我的吗？（反问环节）",
                "category": "反问环节",
                "difficulty": "简单",
                "suggestion": "我想了解三个方面：1）这个岗位入职后前三个月的主要工作目标和挑战是什么？2）团队目前在XX方向的技术栈和架构是怎样的，未来有什么演进计划？3）公司对这个岗位的考核标准和成长路径是怎样的？这些问题能帮助我更好地了解岗位期望，也能让我提前做好准备。",
                "order": 7
            }
        ],
        "source": "mock"
    }
    
    return mock_response

@app.post("/api/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        return {"filename": file.filename, "size": len(contents)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件上传失败: {str(e)}")

@app.post("/api/test-api")
async def test_api(request: AnalysisRequest):
    """测试API Key是否有效"""
    try:
        from openai import OpenAI
        
        api_key = request.api_key or os.getenv("OPENAI_API_KEY")
        
        if not api_key:
            return {"status": "error", "message": "请提供API Key", "detail": "API Key 不能为空"}
        
        base_url = get_base_url(request.provider, request.custom_base_url)
        if not base_url:
            return {"status": "error", "message": "无效的API提供商或未提供自定义Base URL", "detail": f"提供商: {request.provider}"}
        
        client = OpenAI(api_key=api_key, base_url=base_url)
        
        response = client.chat.completions.create(
            model=request.model,
            messages=[{"role": "user", "content": "Hello"}]
        )
        
        return {
            "status": "success", 
            "message": "API Key有效",
            "detail": f"成功连接到 {request.provider}，模型: {request.model}"
        }
        
    except Exception as e:
        error_msg = str(e)
        error_type = type(e).__name__
        return {
            "status": "error", 
            "message": f"连接失败: {error_msg}",
            "detail": f"错误类型: {error_type}\n请检查 API Key、Base URL 和模型名称是否正确"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
