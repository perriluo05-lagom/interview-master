import { useState, useEffect, useRef } from 'react'
import { 
  Upload, 
  FileText, 
  Briefcase, 
  Users, 
  Search, 
  Brain, 
  MessageSquare, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Star,
  Target,
  TrendingUp,
  Zap,
  Settings,
  Key,
  Eye,
  EyeOff,
  TestTube,
  Wifi,
  WifiOff,
  Globe,
  Code2,
  MessageCircle,
  AlertCircle,
  ExternalLink,
  Link2,
  BookOpen
} from 'lucide-react'
import GlassSelect from './components/GlassSelect'
import './index.css'

const API_URL = '/api'

// 默认提供商配置（用于离线模式）
const DEFAULT_PROVIDERS = [
  { name: 'openai', display_name: 'OpenAI', base_url: 'https://api.openai.com/v1', models: ['gpt-4o', 'gpt-4', 'gpt-3.5-turbo'] },
  { name: 'agnes', display_name: 'Agnes AI (免费)', base_url: 'https://apihub.agnes-ai.com/v1', models: ['agnes-2.0-flash'] },
  { name: 'deepseek', display_name: 'DeepSeek', base_url: 'https://api.deepseek.com', models: ['deepseek-chat', 'deepseek-coder'] },
  { name: 'qwen', display_name: '通义千问', base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1', models: ['qwen-turbo', 'qwen-plus', 'qwen-max'] },
  { name: 'kimi', display_name: 'Kimi', base_url: 'https://api.moonshot.cn/v1', models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'] },
  { name: 'groq', display_name: 'Groq (快速)', base_url: 'https://api.groq.com/openai/v1', models: ['llama-3.1-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'] },
  { name: 'together', display_name: 'Together AI', base_url: 'https://api.together.xyz/v1', models: ['meta-llama/Llama-3.1-70B-Instruct-Turbo', 'deepseek-ai/DeepSeek-V3'] },
  { name: 'openrouter', display_name: 'OpenRouter', base_url: 'https://openrouter.ai/api/v1', models: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet'] },
  { name: 'custom', display_name: '自定义', base_url: null, models: ['custom-model'] }
]

function App() {
  const [activeStep, setActiveStep] = useState(1)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [expandedQuestion, setExpandedQuestion] = useState(null)
  const [showApiSettings, setShowApiSettings] = useState(false)
  const [apiKeyVisible, setApiKeyVisible] = useState(false)
  const [apiStatus, setApiStatus] = useState('unknown')
  const [apiError, setApiError] = useState('')
  const [analysisData, setAnalysisData] = useState(null)
  const [providers, setProviders] = useState(DEFAULT_PROVIDERS)
  
  const [formData, setFormData] = useState({
    jd: '',
    resume: null,
    supplementary: '',
    careerPlan: ''
  })

  const [apiConfig, setApiConfig] = useState({
    apiKey: '',
    model: 'gpt-4o',
    provider: 'openai',
    customBaseUrl: ''
  })
  
  const [supplementaryMode, setSupplementaryMode] = useState('text')
  const [supplementaryFiles, setSupplementaryFiles] = useState([])

  // 加载提供商列表
  useEffect(() => {
    fetch(`${API_URL}/providers`)
      .then(res => res.json())
      .then(data => {
        if (data.providers) {
          setProviders(data.providers)
        }
      })
      .catch(() => {
        // 使用默认配置
      })
  }, [])

  // 面试问题板块的锚点引用，用于按钮点击后自动滚动
  const questionsSectionRef = useRef(null)

  const handleTextChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, resume: file }))
    }
  }

  const handleSupplementaryFileChange = (e) => {
    const files = Array.from(e.target.files)
    setSupplementaryFiles(prev => [...prev, ...files])
  }

  const removeSupplementaryFile = (index) => {
    setSupplementaryFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleApiConfigChange = (field, value) => {
    setApiConfig(prev => ({ ...prev, [field]: value }))
  }

  const handleProviderChange = (providerName) => {
    const provider = providers.find(p => p.name === providerName)
    if (provider && provider.models.length > 0) {
      setApiConfig(prev => ({
        ...prev,
        provider: providerName,
        model: provider.models[0],
        customBaseUrl: ''
      }))
    } else {
      setApiConfig(prev => ({
        ...prev,
        provider: providerName,
        customBaseUrl: ''
      }))
    }
  }

  const testApiKey = async () => {
    if (!apiConfig.apiKey.trim()) {
      alert('请输入API Key')
      return
    }
    
    setApiStatus('testing')
    setApiError('')
    try {
      const response = await fetch(`${API_URL}/test-api`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiConfig.apiKey,
          model: apiConfig.model,
          provider: apiConfig.provider,
          custom_base_url: apiConfig.customBaseUrl,
          jd: 'test'
        })
      })
      const result = await response.json()
      setApiStatus(result.status)
      if (result.status === 'error') {
        setApiError(result.message || '连接失败')
      } else {
        setApiError('')
      }
    } catch (err) {
      setApiStatus('error')
      setApiError('无法连接到后端服务器，请确保后端服务已启动 (http://localhost:8000)')
    }
  }

  const handleSubmit = async () => {
    if (!formData.jd.trim()) {
      alert('请填写岗位JD')
      return
    }

    setIsAnalyzing(true)
    try {
      // 使用 FormData 上传真实文件（让后端能解析简历内容，而非只拿到文件名）
      const formPayload = new FormData()
      formPayload.append('jd', formData.jd)
      formPayload.append('supplementary', formData.supplementary || '')
      formPayload.append('career_plan', formData.careerPlan || '')
      formPayload.append('api_key', apiConfig.apiKey || '')
      formPayload.append('model', apiConfig.model)
      formPayload.append('provider', apiConfig.provider)
      formPayload.append('custom_base_url', apiConfig.customBaseUrl || '')

      // 简历文件（单个）
      if (formData.resume) {
        formPayload.append('resume_file', formData.resume)
      }

      // 补充材料附件（多个）
      if (supplementaryFiles.length > 0) {
        supplementaryFiles.forEach((file) => {
          formPayload.append('supplementary_files', file)
        })
      }

      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        body: formPayload
        // 注意：使用 FormData 时不要手动设置 Content-Type，浏览器会自动设置 boundary
      })

      if (!response.ok) {
        throw new Error('分析失败')
      }

      const result = await response.json()
      setAnalysisData(result)
      setShowResults(true)
      setActiveStep(2)
    } catch (error) {
      console.error('分析错误:', error)
      alert('分析过程中出现错误，请检查网络连接或API配置')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const steps = [
    { id: 1, title: '输入信息', icon: '输入' },
    { id: 2, title: '智能分析', icon: '分析' },
    { id: 3, title: '面试准备', icon: '准备' }
  ]

  const currentProvider = providers.find(p => p.name === apiConfig.provider) || DEFAULT_PROVIDERS[0]

  const companyAnalysis = analysisData?.company_analysis || {
    company_name: '从JD分析的公司',
    industry: '互联网/科技',
    description: '根据岗位JD分析，这是一家科技公司，注重创新和技术发展。',
    culture: ['创新', '团队合作', '客户至上'],
    values: '未找到公开信息（演示模式，配置API Key后将从权威渠道获取）',
    mission: '未找到公开信息（演示模式）',
    vision: '未找到公开信息（演示模式）',
    website: '未找到公开信息（演示模式，配置API Key后将尝试获取真实官网链接）',
    business_overview: '未找到公开信息（演示模式，配置API Key后将分析公司主营业务）',
    position_in_company: '未找到公开信息（演示模式，配置API Key后将分析此岗位在公司的定位）',
    data_source: '基于JD内容推断，建议配置API Key获取权威渠道真实信息'
  }

  const jobAnalysis = analysisData?.job_analysis || {
    position: '从JD提取的岗位名称',
    department: '技术部',
    location: '未知',
    salary: '根据市场行情推断',
    job_description: formData.jd?.slice(0, 200) + '...' || '',
    requirements: ['具备相关技术能力', '良好的沟通能力', '团队协作精神'],
    match_score: 75,
    match_analysis: '基于您提供的信息，您的背景与该岗位有一定匹配度。建议重点准备技术面试，突出相关项目经验。'
  }

  const interviewQuestions = analysisData?.interview_questions || [
    {
      id: 1,
      question: '请做一个简单的自我介绍',
      category: '自我介绍',
      difficulty: '简单',
      frequency: '高频',
      focus_point: '考察候选人的表达能力、核心优势提炼能力，以及与岗位的匹配度',
      suggestion: '面试官您好，我叫XXX，毕业于XX大学XX专业。过去X年我一直在XX领域工作，主要负责XX方向。在上一段经历中，我主导了XX项目，通过XX方法解决了XX问题，最终实现了XX成果。我关注到贵公司正在招聘XX岗位，这与我的职业发展方向高度契合，希望能有机会加入团队，发挥我的专业能力。',
      highlights: '通过具体项目成果展示专业能力，明确表达与岗位的匹配度，展现职业发展方向的一致性',
      follow_up_questions: ['你觉得自己最大的优势是什么？', '为什么选择我们公司？'],
      answer_suggestions: '注意控制时间在1-2分钟，突出重点，避免流水账式介绍。结合岗位JD突出相关经验，不要背诵简历。',
      order: 1
    },
    {
      id: 2,
      question: '请介绍一下你对这个岗位的理解，以及你具备哪些核心能力？',
      category: '岗位能力',
      difficulty: '中等',
      frequency: '高频',
      focus_point: '考察候选人对岗位的理解深度，以及核心能力与岗位需求的匹配程度',
      suggestion: '根据我对JD的理解，这个岗位主要负责XX工作，核心要求包括XX、XX和XX能力。我具备X年相关经验，在XX技术/工具方面有深入实践。比如在上一份工作中，我使用XX完成了XX任务，提升了XX指标。我认为我的XX能力和XX经验能够很好地胜任这个岗位的要求。',
      highlights: '展示对岗位的深入理解，用具体案例证明能力匹配，量化成果增强说服力',
      follow_up_questions: ['你觉得这个岗位最核心的挑战是什么？', '如果让你做这个岗位，你会从哪里入手？'],
      answer_suggestions: '不要只复述JD内容，要有自己的理解和分析。结合自身经验说明匹配度，避免空谈。',
      order: 2
    },
    {
      id: 3,
      question: '你在简历中提到的XX项目，能详细讲讲吗？',
      category: '简历深挖',
      difficulty: '中等',
      frequency: '高频',
      focus_point: '考察项目经历的真实性、深度，以及候选人在项目中的角色和贡献',
      suggestion: '这个项目是我在XX公司期间主导的，背景是XX业务面临XX挑战。我的角色是XX，主要负责XX。在技术方案上，我选择了XX方案，因为XX。过程中遇到了XX困难，我通过XX方法解决。最终项目交付了XX成果，数据指标提升了XX%。这个经历让我深刻理解了XX的重要性。',
      highlights: '清晰的项目背景和目标，明确的个人角色和贡献，量化的成果数据，体现问题解决能力和技术选型能力',
      follow_up_questions: ['项目中遇到的最大困难是什么？', '你在项目中做了哪些关键决策？'],
      answer_suggestions: '使用STAR法则（情境-任务-行动-结果），突出个人贡献而非团队成果，准备好项目细节应对追问。',
      order: 3
    },
    {
      id: 4,
      question: '描述一个你遇到的技术难题及解决过程',
      category: '项目深挖',
      difficulty: '困难',
      frequency: '中频',
      focus_point: '考察技术能力、问题解决能力、学习能力和创新思维',
      suggestion: '在XX项目中，我们遇到了XX技术难题，具体表现为XX。我首先通过XX方式分析问题根因，发现是XX导致的。然后我调研了XX、XX等几种方案，最终选择了XX方案，因为XX。实施过程中，我编写了XX代码/设计了XX架构，并通过XX测试验证。最终问题得到解决，系统性能提升了XX%。这个经历锻炼了我XX能力。',
      highlights: '展现系统性的问题分析能力，多方案对比的决策能力，以及持续学习和创新的能力',
      follow_up_questions: ['你尝试过哪些失败的方案？', '这个方案的优缺点是什么？'],
      answer_suggestions: '不要只说成功的结果，也要分享过程中的尝试和失败，展现真实的思考过程。',
      order: 4
    },
    {
      id: 5,
      question: '你未来3-5年的职业规划是什么？',
      category: '行为面试',
      difficulty: '中等',
      frequency: '高频',
      focus_point: '考察职业规划清晰度、稳定性，以及与公司发展方向的匹配度',
      suggestion: '我的职业规划分为三个阶段。短期（1年内）：快速融入团队，掌握XX技术栈，独立承担XX模块开发。中期（2-3年）：在XX领域深入钻研，成为团队的技术骨干，能够带领小组完成XX级别的项目。长期（3-5年）：向XX方向发展（技术专家/管理岗），主导XX方向的技术决策，为公司的XX业务贡献价值。贵公司的XX方向与我的规划高度契合。',
      highlights: '展示清晰的职业发展路径，体现学习意愿和成长潜力，表达对公司的认同感',
      follow_up_questions: ['如果公司发展方向与你的规划不一致怎么办？', '你计划如何实现这个规划？'],
      answer_suggestions: '避免空谈，要有具体的目标和行动计划。结合公司实际情况，表达愿意与公司共同成长的态度。',
      order: 5
    },
    {
      id: 6,
      question: '讲述一次你在团队中处理冲突的经历',
      category: '行为面试',
      difficulty: '中等',
      frequency: '中频',
      focus_point: '考察团队协作能力、沟通能力、冲突解决能力',
      suggestion: '在XX项目中，我和XX同事在技术方案上产生了分歧，他主张XX方案，我倾向XX方案。我没有直接否定他，而是约他一起梳理需求，列出两个方案的优缺点对比表。通过客观分析数据，我们发现XX方案在XX方面更优。最终他认可了我的方案，我也采纳了他XX的建议。这次经历让我学会了用数据和逻辑解决分歧，而不是情绪化对抗。',
      highlights: '展现成熟的沟通方式，用数据和事实说话，体现团队合作精神和同理心',
      follow_up_questions: ['你当时的情绪是怎样的？', '如果对方仍然不认可怎么办？'],
      answer_suggestions: '重点展示处理冲突的方法和过程，而不是批判对方。强调团队目标优先于个人观点。',
      order: 6
    },
    {
      id: 7,
      question: '如果让你负责一个新的产品功能，你会如何规划和推进？',
      category: '案例分析',
      difficulty: '困难',
      frequency: '中频',
      focus_point: '考察产品思维、项目管理能力、优先级判断能力',
      suggestion: '首先我会明确目标：这个功能要解决什么问题，目标用户是谁，成功的标准是什么。然后进行需求分析，收集用户反馈和业务方的需求，梳理出功能清单和优先级。接下来设计方案，包括技术架构、用户流程、UI设计等。在开发过程中，我会制定里程碑计划，定期同步进度，及时解决遇到的问题。最后上线后，通过数据监控和用户反馈评估效果，进行迭代优化。',
      highlights: '展示系统化的产品思考能力，清晰的项目管理流程，数据驱动的决策方式',
      follow_up_questions: ['如何确定需求优先级？', '如果资源不足怎么办？'],
      answer_suggestions: '结构清晰，逻辑完整，体现产品思维和工程思维的结合。',
      order: 7
    },
    {
      id: 8,
      question: '你有什么想问我的吗？（反问环节）',
      category: '反问环节',
      difficulty: '简单',
      frequency: '高频',
      focus_point: '考察候选人的积极性、思考深度，以及对公司和岗位的真实兴趣',
      suggestion: '我想了解三个方面：1）这个岗位入职后前三个月的主要工作目标和挑战是什么？2）团队目前在XX方向的技术栈和架构是怎样的，未来有什么演进计划？3）公司对这个岗位的考核标准和成长路径是怎样的？这些问题能帮助我更好地了解岗位期望，也能让我提前做好准备。',
      highlights: '问题有深度，体现对岗位的认真思考，展示积极主动的态度',
      follow_up_questions: [],
      answer_suggestions: '不要问薪资、福利等基础问题，这些可以在后续环节了解。问能体现你对岗位和公司真正感兴趣的问题。',
      order: 8
    },
    {
      id: 9,
      question: '你做过最有成就感的一件事是什么？',
      category: '行为面试',
      difficulty: '中等',
      frequency: '中频',
      focus_point: '考察自我认知、成就感来源、价值观',
      suggestion: '最有成就感的是XX项目。当时面临XX挑战，我通过XX方法解决了问题，最终实现了XX成果。这个过程中，我不仅提升了XX能力，更重要的是学会了XX思维方式。看到自己的努力带来了实实在在的价值，让我非常有成就感。',
      highlights: '展示个人成长和价值追求，体现自我驱动力和成就感来源',
      follow_up_questions: ['为什么这件事让你有成就感？', '这件事对你的职业发展有什么影响？'],
      answer_suggestions: '结合职业发展，展示积极向上的价值观。',
      order: 9
    },
    {
      id: 10,
      question: '如果项目进度落后，你会怎么做？',
      category: '行为面试',
      difficulty: '困难',
      frequency: '低频',
      focus_point: '考察抗压能力、问题解决能力、项目管理能力',
      suggestion: '首先我会冷静分析原因：是需求变更、技术难题还是资源不足？然后与团队沟通，重新评估工作量和优先级，确定可以调整的部分。如果是技术难题，我会组织团队攻关或寻求外部帮助。如果是资源问题，我会与上级沟通争取更多支持。同时，我会及时向相关方同步进度变化，管理好预期。',
      highlights: '展现冷静分析问题的能力，积极主动解决问题的态度，良好的沟通协调能力',
      follow_up_questions: ['有没有实际经历过这种情况？', '你会如何平衡质量和进度？'],
      answer_suggestions: '展示系统性的问题解决能力，强调沟通和协作的重要性。',
      order: 10
    }
  ]

  // 面试问题按板块分组并排序
  const categoryOrder = ['自我介绍', '岗位能力', '简历深挖', '项目深挖', '行为面试', '案例分析', '反问环节']
  const groupedQuestions = interviewQuestions.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = []
    acc[q.category].push(q)
    return acc
  }, {})
  const sortedCategories = Object.keys(groupedQuestions).sort((a, b) => {
    const idxA = categoryOrder.indexOf(a)
    const idxB = categoryOrder.indexOf(b)
    if (idxA === -1 && idxB === -1) return 0
    if (idxA === -1) return 1
    if (idxB === -1) return -1
    return idxA - idxB
  })

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 背景视频 */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1551009175-8a68da93d5f9?q=80&w=2070&auto=format&fit=crop"
        >
          <source 
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_171521_25968ba2-b594-4b32-aab7-f6b69398a6fa.mp4" 
            type="video/mp4" 
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/80"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* 主内容区 */}
      <div className="relative z-10 min-h-screen">
        {/* 头部 */}
        <header className="py-8 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white text-glow font-zhongsong">
                Agent Interviewer
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {apiStatus === 'success' && (
                <div className="glass-card px-3 py-1.5 flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400 font-zhongsong">已连接</span>
                </div>
              )}
              {apiStatus === 'error' && (
                <div className="glass-card px-3 py-1.5 flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400 font-zhongsong">连接失败</span>
                </div>
              )}
              <button
                onClick={() => setShowApiSettings(!showApiSettings)}
                className={`glass-card px-4 py-2 flex items-center gap-2 transition-all ${
                  showApiSettings ? 'bg-purple-500/30 border-purple-500/50' : ''
                }`}
              >
                <Settings className="w-4 h-4 text-purple-300" />
                <span className="text-sm text-white/80 font-zhongsong">API配置</span>
              </button>
            </div>
          </div>
        </header>

        {/* API配置面板 */}
        {showApiSettings && (
          <div className="max-w-6xl mx-auto px-6 mb-6">
            <div className="glass-card p-6 glow-effect">
              <h3 className="text-lg font-bold text-white mb-4 font-zhongsong flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-400" />
                AI API配置
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {/* API Key */}
                <div>
                  <label className="block text-white/60 text-sm mb-2 font-zhongsong">API Key</label>
                  <div className="relative">
                    <input
                      type={apiKeyVisible ? 'text' : 'password'}
                      value={apiConfig.apiKey}
                      onChange={(e) => handleApiConfigChange('apiKey', e.target.value)}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 transition-colors font-zhongsong pr-12"
                      placeholder="sk-..."
                    />
                    <button
                      onClick={() => setApiKeyVisible(!apiKeyVisible)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                    >
                      {apiKeyVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                {/* API提供商 */}
                <GlassSelect
                  label="API提供商"
                  options={providers.map(p => ({ value: p.name, label: p.display_name }))}
                  value={apiConfig.provider}
                  onChange={handleProviderChange}
                />
                
                {/* 自定义Base URL */}
                {apiConfig.provider === 'custom' && (
                  <div className="md:col-span-2">
                    <label className="block text-white/60 text-sm mb-2 font-zhongsong flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      自定义Base URL
                    </label>
                    <input
                      type="text"
                      value={apiConfig.customBaseUrl}
                      onChange={(e) => handleApiConfigChange('customBaseUrl', e.target.value)}
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 transition-colors font-zhongsong"
                      placeholder="https://api.example.com/v1"
                    />
                  </div>
                )}
                
                {/* 模型选择 */}
                <GlassSelect
                  label="模型选择"
                  options={currentProvider.models.map(m => ({ value: m, label: m }))}
                  value={apiConfig.model}
                  onChange={(value) => handleApiConfigChange('model', value)}
                />
                
                {/* 测试按钮 */}
                <div className="flex items-end">
                  <button
                    onClick={testApiKey}
                    disabled={apiStatus === 'testing'}
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-zhongsong disabled:opacity-50"
                  >
                    {apiStatus === 'testing' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        测试中...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-5 h-5" />
                        测试连接
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* 错误信息提示 */}
              {apiStatus === 'error' && apiError && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                  <p className="text-red-300 text-sm font-zhongsong flex items-start gap-2">
                    <WifiOff className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{apiError}</span>
                  </p>
                </div>
              )}
              
              {/* 成功信息提示 */}
              {apiStatus === 'success' && (
                <div className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                  <p className="text-green-300 text-sm font-zhongsong flex items-start gap-2">
                    <Wifi className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>API连接成功！可以开始使用AI分析功能了。</span>
                  </p>
                </div>
              )}
              
              {/* 提供商信息 */}
              {currentProvider.base_url && apiConfig.provider !== 'custom' && (
                <div className="mt-4 p-3 bg-black/30 rounded-lg flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-purple-400" />
                  <span className="text-white/60 text-sm font-zhongsong">
                    Base URL: {currentProvider.base_url}
                  </span>
                </div>
              )}
              
              <p className="text-white/40 text-sm mt-4 font-zhongsong">
                提示：如果不配置API Key，系统将使用模拟数据进行演示。配置后将使用真实AI进行分析。
              </p>
            </div>
          </div>
        )}

        {/* 进度条 */}
        <div className="max-w-4xl mx-auto px-6 mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-zhongsong transition-all duration-300 ${
                    activeStep >= step.id 
                      ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white glow-effect' 
                      : 'bg-white/10 text-white/50'
                  }`}
                >
                  {step.id}
                </div>
                <span className={`ml-3 font-zhongsong transition-colors ${
                  activeStep >= step.id ? 'text-white' : 'text-white/50'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-20 h-1 mx-4 rounded-full transition-colors ${
                    activeStep > step.id ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-white/10'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 内容区域 */}
        <main className="max-w-4xl mx-auto px-6 pb-20">
          {/* 步骤1：输入信息 */}
          {activeStep === 1 && !showResults && (
            <div className="glass-card p-8 glow-effect animate-float">
              <h2 className="text-2xl font-bold text-white mb-6 font-zhongsong flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-400" />
                请输入您的求职信息
              </h2>
              
              <div className="space-y-6">
                {/* 岗位JD */}
                <div>
                  <label className="block text-white/80 mb-2 font-zhongsong flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    岗位JD <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    className="w-full h-40 px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 transition-colors resize-none font-zhongsong"
                    placeholder="请粘贴岗位JD内容，包括岗位职责、任职要求等..."
                    value={formData.jd}
                    onChange={(e) => handleTextChange('jd', e.target.value)}
                  />
                </div>

                {/* 简历上传 */}
                <div>
                  <label className="block text-white/80 mb-2 font-zhongsong flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    简历附件（可选）
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-purple-500/50 transition-colors bg-black/20">
                    {formData.resume ? (
                      <div className="flex items-center gap-2 text-white">
                        <FileText className="w-5 h-5" />
                        <span className="font-zhongsong">{formData.resume.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-white/50">
                        <Upload className="w-8 h-8" />
                        <span className="font-zhongsong">点击上传简历（PDF/DOC）</span>
                      </div>
                    )}
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>

                {/* 补充材料 */}
                <div>
                  <label className="block text-white/80 mb-2 font-zhongsong flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    补充材料（可选）
                  </label>
                  {/* 模式切换按钮 */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setSupplementaryMode('text')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-zhongsong transition-all ${
                        supplementaryMode === 'text' 
                          ? 'bg-purple-500/30 text-white border border-purple-500/50' 
                          : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      文本/链接
                    </button>
                    <button
                      onClick={() => setSupplementaryMode('file')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-zhongsong transition-all ${
                        supplementaryMode === 'file' 
                          ? 'bg-purple-500/30 text-white border border-purple-500/50' 
                          : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      上传附件
                    </button>
                  </div>
                  {/* 根据模式显示不同输入 */}
                  {supplementaryMode === 'text' ? (
                    <textarea
                      className="w-full h-24 px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 transition-colors resize-none font-zhongsong"
                      placeholder="其他相关信息，如项目链接、作品集、技能证书等..."
                      value={formData.supplementary}
                      onChange={(e) => handleTextChange('supplementary', e.target.value)}
                    />
                  ) : (
                    <div>
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-purple-500/50 transition-colors bg-black/20">
                        <div className="flex flex-col items-center gap-2 text-white/50">
                          <Upload className="w-8 h-8" />
                          <span className="font-zhongsong">点击上传补充材料（支持多个文件）</span>
                        </div>
                        <input type="file" multiple className="hidden" onChange={handleSupplementaryFileChange} />
                      </label>
                      {/* 已选文件列表 */}
                      {supplementaryFiles.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {supplementaryFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between px-3 py-2 bg-black/30 rounded-lg">
                              <div className="flex items-center gap-2 text-white overflow-hidden">
                                <FileText className="w-4 h-4 flex-shrink-0" />
                                <span className="font-zhongsong text-sm truncate">{file.name}</span>
                              </div>
                              <button 
                                onClick={() => removeSupplementaryFile(index)} 
                                className="text-red-400 hover:text-red-300 flex-shrink-0 ml-2"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 职业规划 */}
                <div>
                  <label className="block text-white/80 mb-2 font-zhongsong flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    职业规划（可选）
                  </label>
                  <textarea
                    className="w-full h-24 px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 transition-colors resize-none font-zhongsong"
                    placeholder="您的短期和长期职业规划是什么？"
                    value={formData.careerPlan}
                    onChange={(e) => handleTextChange('careerPlan', e.target.value)}
                  />
                </div>

                {/* 提交按钮 */}
                <button
                  onClick={handleSubmit}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-zhongsong text-lg glow-effect hover:scale-[1.02]"
                >
                  <Sparkles className="w-5 h-5" />
                  {apiConfig.apiKey ? '开始AI智能分析' : '开始演示分析'}
                </button>
                
                {!apiConfig.apiKey && (
                  <p className="text-center text-white/40 text-sm font-zhongsong">
                    当前使用演示模式，配置API Key以获取真实分析结果
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 分析中状态 */}
          {isAnalyzing && (
            <div className="glass-card p-12 glow-effect text-center">
              <div className="relative">
                <div className="w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full animate-ping opacity-20"></div>
                  <div className="relative w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                  </div>
                </div>
                <h3 className="text-xl text-white font-zhongsong mb-2">正在分析中...</h3>
                <p className="text-white/60 font-zhongsong">
                  {apiConfig.apiKey ? 'AI正在分析岗位需求、搜索公司信息、预测面试问题...' : '正在加载演示数据...'}
                </p>
              </div>
            </div>
          )}

          {/* 步骤2：智能分析结果 */}
          {activeStep === 2 && showResults && (
            <div className="space-y-6">
              {/* 数据源标识 */}
              {analysisData?.source === 'llm' && (
                <div className="glass-card px-4 py-2 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-300" />
                  <span className="text-sm text-white/60 font-zhongsong">AI分析结果</span>
                </div>
              )}

              {/* 公司分析 */}
              <div className="glass-card p-6 glow-effect">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white font-zhongsong">公司分析</h3>
                </div>
                {/* 基本信息 */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-white/50 text-sm font-zhongsong">公司名称</p>
                    <p className="text-white font-zhongsong">{companyAnalysis.company_name}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-white/50 text-sm font-zhongsong">所属行业</p>
                    <p className="text-white font-zhongsong">{companyAnalysis.industry}</p>
                  </div>
                </div>
                <p className="text-white/80 mb-4 font-zhongsong">{companyAnalysis.description}</p>
                
                {/* 企业文化关键词 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-white/50 font-zhongsong">企业文化：</span>
                  {companyAnalysis.culture.map((item, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-zhongsong">
                      {item}
                    </span>
                  ))}
                </div>
                
                {/* 核心理念：价值观、使命、愿景 */}
                <div className="space-y-3 mb-4">
                  {/* 核心价值观 */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-white/80 font-zhongsong text-sm">核心价值观</span>
                    </div>
                    <p className={`font-zhongsong ${companyAnalysis.values?.includes('未找到') ? 'text-white/50 italic' : 'text-white'}`}>
                      {companyAnalysis.values}
                    </p>
                  </div>
                  
                  {/* 公司使命 */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-white/80 font-zhongsong text-sm">公司使命</span>
                    </div>
                    <p className={`font-zhongsong ${companyAnalysis.mission?.includes('未找到') ? 'text-white/50 italic' : 'text-white'}`}>
                      {companyAnalysis.mission}
                    </p>
                  </div>
                  
                  {/* 公司愿景 */}
                  <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-white/80 font-zhongsong text-sm">公司愿景</span>
                    </div>
                    <p className={`font-zhongsong ${companyAnalysis.vision?.includes('未找到') ? 'text-white/50 italic' : 'text-white'}`}>
                      {companyAnalysis.vision}
                    </p>
                  </div>

                  {/* 公司官网链接 */}
                  <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-cyan-400" />
                      <span className="text-white/80 font-zhongsong text-sm">公司官网</span>
                    </div>
                    {companyAnalysis.website && !companyAnalysis.website.includes('未找到') ? (
                      <a
                        href={companyAnalysis.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-300 hover:text-cyan-200 underline break-all font-zhongsong flex items-center gap-1"
                      >
                        {companyAnalysis.website}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    ) : (
                      <p className="text-white/50 italic font-zhongsong">{companyAnalysis.website}</p>
                    )}
                  </div>

                  {/* 主营业务介绍 */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4 text-purple-400" />
                      <span className="text-white/80 font-zhongsong text-sm">主营业务介绍</span>
                    </div>
                    <p className={`font-zhongsong text-sm leading-relaxed ${companyAnalysis.business_overview?.includes('未找到') ? 'text-white/50 italic' : 'text-white/90'}`}>
                      {companyAnalysis.business_overview}
                    </p>
                  </div>

                  {/* 岗位在公司中的定位 */}
                  <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-orange-400" />
                      <span className="text-white/80 font-zhongsong text-sm">岗位在公司中的定位</span>
                    </div>
                    <p className={`font-zhongsong text-sm leading-relaxed ${companyAnalysis.position_in_company?.includes('未找到') ? 'text-white/50 italic' : 'text-white/90'}`}>
                      {companyAnalysis.position_in_company}
                    </p>
                  </div>
                </div>

                {/* 信息来源说明 */}
                <div className="flex items-center gap-2 text-white/40 text-xs font-zhongsong pt-2 border-t border-white/5">
                  <Globe className="w-3 h-3 flex-shrink-0" />
                  <span>信息来源：{companyAnalysis.data_source}</span>
                </div>
              </div>

              {/* 岗位分析 */}
              <div className="glass-card p-6 glow-effect">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white font-zhongsong">岗位分析</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-white/50 text-sm font-zhongsong">岗位名称</p>
                    <p className="text-white font-zhongsong">{jobAnalysis.position}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-white/50 text-sm font-zhongsong">所属部门</p>
                    <p className="text-white font-zhongsong">{jobAnalysis.department}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-white/50 text-sm font-zhongsong">工作地点</p>
                    <p className="text-white font-zhongsong">{jobAnalysis.location}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-white/50 text-sm font-zhongsong">薪资范围</p>
                    <p className="text-white font-zhongsong">{jobAnalysis.salary}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <h4 className="text-white/80 font-zhongsong mb-2">岗位描述</h4>
                  <p className="text-white/70 font-zhongsong">{jobAnalysis.job_description}</p>
                </div>
                <div className="mb-4">
                  <h4 className="text-white/80 font-zhongsong mb-2">任职要求</h4>
                  <ul className="space-y-1">
                    {jobAnalysis.requirements.map((req, idx) => (
                      <li key={idx} className="text-white/70 font-zhongsong flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-zhongsong flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      匹配度评估
                    </span>
                    <span className="text-3xl font-bold text-white text-glow font-zhongsong">
                      {jobAnalysis.match_score}%
                    </span>
                  </div>
                  <div className="w-full bg-black/30 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${jobAnalysis.match_score}%` }}
                    ></div>
                  </div>
                  <p className="text-white/70 font-zhongsong">{jobAnalysis.match_analysis}</p>
                </div>

                {/* 详细岗位分析 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {/* 核心职责 */}
                  {(jobAnalysis.core_responsibilities && jobAnalysis.core_responsibilities.length > 0) && (
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4 text-blue-400" />
                        <span className="text-white/80 font-zhongsong text-sm font-bold">核心职责</span>
                      </div>
                      <ul className="space-y-1">
                        {jobAnalysis.core_responsibilities.map((item, idx) => (
                          <li key={idx} className="text-white/60 font-zhongsong text-sm flex items-start gap-2">
                            <span className="text-blue-400">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* 业务目标 */}
                  {(jobAnalysis.business_objectives && jobAnalysis.business_objectives.length > 0) && (
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-orange-400" />
                        <span className="text-white/80 font-zhongsong text-sm font-bold">业务目标</span>
                      </div>
                      <ul className="space-y-1">
                        {jobAnalysis.business_objectives.map((item, idx) => (
                          <li key={idx} className="text-white/60 font-zhongsong text-sm flex items-start gap-2">
                            <span className="text-orange-400">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* 真正看重的能力 */}
                  {(jobAnalysis.key_competencies && jobAnalysis.key_competencies.length > 0) && (
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-white/80 font-zhongsong text-sm font-bold">核心能力</span>
                      </div>
                      <ul className="space-y-1">
                        {jobAnalysis.key_competencies.map((item, idx) => (
                          <li key={idx} className="text-white/60 font-zhongsong text-sm flex items-start gap-2">
                            <span className="text-yellow-400">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* 隐性要求 */}
                  {(jobAnalysis.hidden_requirements && jobAnalysis.hidden_requirements.length > 0) && (
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4 text-purple-400" />
                        <span className="text-white/80 font-zhongsong text-sm font-bold">隐性要求</span>
                      </div>
                      <ul className="space-y-1">
                        {jobAnalysis.hidden_requirements.map((item, idx) => (
                          <li key={idx} className="text-white/60 font-zhongsong text-sm flex items-start gap-2">
                            <span className="text-purple-400">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* 高频考察点 */}
                  {(jobAnalysis.high_frequency_points && jobAnalysis.high_frequency_points.length > 0) && (
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-white/80 font-zhongsong text-sm font-bold">高频考察点</span>
                      </div>
                      <ul className="space-y-1">
                        {jobAnalysis.high_frequency_points.map((item, idx) => (
                          <li key={idx} className="text-white/60 font-zhongsong text-sm flex items-start gap-2">
                            <span className="text-green-400">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* 面试官关注重点 */}
                  {(jobAnalysis.interviewer_focus && jobAnalysis.interviewer_focus.length > 0) && (
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Search className="w-4 h-4 text-cyan-400" />
                        <span className="text-white/80 font-zhongsong text-sm font-bold">面试官关注</span>
                      </div>
                      <ul className="space-y-1">
                        {jobAnalysis.interviewer_focus.map((item, idx) => (
                          <li key={idx} className="text-white/60 font-zhongsong text-sm flex items-start gap-2">
                            <span className="text-cyan-400">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* 匹配优势 */}
                  {(jobAnalysis.candidate_strengths && jobAnalysis.candidate_strengths.length > 0) && (
                    <div className="bg-gradient-to-br from-green-500/10 to-transparent rounded-xl p-4 border border-green-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-zhongsong text-sm font-bold">匹配优势</span>
                      </div>
                      <ul className="space-y-1">
                        {jobAnalysis.candidate_strengths.map((item, idx) => (
                          <li key={idx} className="text-white/70 font-zhongsong text-sm flex items-start gap-2">
                            <span className="text-green-400">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* 风险点 */}
                  {(jobAnalysis.potential_risks && jobAnalysis.potential_risks.length > 0) && (
                    <div className="bg-gradient-to-br from-red-500/10 to-transparent rounded-xl p-4 border border-red-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 font-zhongsong text-sm font-bold">风险点</span>
                      </div>
                      <ul className="space-y-1">
                        {jobAnalysis.potential_risks.map((item, idx) => (
                          <li key={idx} className="text-white/70 font-zhongsong text-sm flex items-start gap-2">
                            <span className="text-red-400">⚠</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* 重点展示经历 */}
                  {(jobAnalysis.key_experiences && jobAnalysis.key_experiences.length > 0) && (
                    <div className="bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl p-4 border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 font-zhongsong text-sm font-bold">重点展示经历</span>
                      </div>
                      <ul className="space-y-1">
                        {jobAnalysis.key_experiences.map((item, idx) => (
                          <li key={idx} className="text-white/70 font-zhongsong text-sm flex items-start gap-2">
                            <span className="text-purple-400">★</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* 下一步按钮 */}
              <button
                onClick={() => {
                  setActiveStep(3)
                  // 等待状态更新后 DOM 渲染完成，再滚动到面试问题板块顶部
                  setTimeout(() => {
                    questionsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }, 100)
                }}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-zhongsong text-lg glow-effect hover:scale-[1.02]"
              >
                <Zap className="w-5 h-5" />
                查看面试问题预测
              </button>
            </div>
          )}

          {/* 步骤3：面试问题预测 */}
          {activeStep === 3 && showResults && (
            <div className="space-y-6" ref={questionsSectionRef}>
              <div className="glass-card p-6 glow-effect">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white font-zhongsong">面试问题预测</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-300" />
                    <span className="text-white/60 text-sm font-zhongsong">
                      {analysisData?.source === 'llm' ? 'AI生成' : '演示数据'}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  {sortedCategories.map(category => (
                    <div key={category}>
                      {/* 板块标题 */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                        <h4 className="text-lg font-bold text-white font-zhongsong">{category}</h4>
                        <span className="text-white/40 text-sm font-zhongsong">({groupedQuestions[category].length}题)</span>
                      </div>
                      {/* 板块内的问题 */}
                      <div className="space-y-3 ml-3">
                        {groupedQuestions[category]
                          .sort((a, b) => (a.order || a.id) - (b.order || b.id))
                          .map(item => (
                          <div 
                            key={item.id} 
                            className="glass-card-dark p-4 hover:bg-black/50 transition-colors cursor-pointer"
                            onClick={() => setExpandedQuestion(expandedQuestion === item.id ? null : item.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <span className={`px-2 py-0.5 rounded text-xs font-zhongsong ${
                                    item.difficulty === '简单' ? 'bg-green-500/20 text-green-300' :
                                    item.difficulty === '中等' ? 'bg-yellow-500/20 text-yellow-300' :
                                    'bg-red-500/20 text-red-300'
                                  }`}>
                                    {item.difficulty}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-xs font-zhongsong ${
                                    item.frequency === '高频' ? 'bg-purple-500/20 text-purple-300' :
                                    item.frequency === '中频' ? 'bg-blue-500/20 text-blue-300' :
                                    'bg-gray-500/20 text-gray-300'
                                  }`}>
                                    {item.frequency}
                                  </span>
                                  {item.question_source && (
                                    <span className="px-2 py-0.5 rounded text-xs font-zhongsong bg-cyan-500/20 text-cyan-300 flex items-center gap-1">
                                      <Search className="w-3 h-3" />
                                      {item.question_source}
                                    </span>
                                  )}
                                </div>
                                <p className="text-white font-zhongsong">{item.question}</p>
                              </div>
                              <div className="ml-4">
                                {expandedQuestion === item.id ? (
                                  <ChevronUp className="w-5 h-5 text-white/50" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-white/50" />
                                )}
                              </div>
                            </div>

                            {expandedQuestion === item.id && (
                              <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                                {/* 考察点 */}
                                {item.focus_point && (
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Target className="w-4 h-4 text-orange-400" />
                                      <span className="text-white/80 font-zhongsong">考察点</span>
                                    </div>
                                    <p className="text-white/60 font-zhongsong text-sm">{item.focus_point}</p>
                                  </div>
                                )}

                                {/* 参考回答 */}
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-blue-400" />
                                    <span className="text-white/80 font-zhongsong">参考回答</span>
                                  </div>
                                  <div className="text-white/60 font-zhongsong text-sm leading-relaxed space-y-2">
                                    {item.suggestion.split(/\n+/).filter(p => p.trim()).map((para, idx) => (
                                      <p key={idx} className="whitespace-pre-wrap">{para.trim()}</p>
                                    ))}
                                  </div>
                                </div>

                                {/* 回答亮点 */}
                                {item.highlights && (
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Star className="w-4 h-4 text-yellow-400" />
                                      <span className="text-white/80 font-zhongsong">回答亮点</span>
                                    </div>
                                    <p className="text-white/60 font-zhongsong text-sm">{item.highlights}</p>
                                  </div>
                                )}

                                {/* 可能追问 */}
                                {item.follow_up_questions && item.follow_up_questions.length > 0 && (
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <MessageCircle className="w-4 h-4 text-green-400" />
                                      <span className="text-white/80 font-zhongsong">面试官可能追问</span>
                                    </div>
                                    <ul className="text-white/60 font-zhongsong text-sm space-y-1">
                                      {item.follow_up_questions.map((q, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                          <span className="text-purple-400">•</span>
                                          {q}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* 回答建议 */}
                                {item.answer_suggestions && (
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <AlertCircle className="w-4 h-4 text-red-400" />
                                      <span className="text-white/80 font-zhongsong">回答建议</span>
                                    </div>
                                    <p className="text-white/60 font-zhongsong text-sm">{item.answer_suggestions}</p>
                                  </div>
                                )}

                                {/* 问题来源链接（面经贴） */}
                                {item.source_references && item.source_references.length > 0 && (
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Link2 className="w-4 h-4 text-cyan-400" />
                                      <span className="text-white/80 font-zhongsong">问题来源链接（面经/经验贴）</span>
                                    </div>
                                    <ul className="space-y-1">
                                      {item.source_references.map((link, idx) => (
                                        <li key={idx}>
                                          <a
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-cyan-300 hover:text-cyan-200 underline break-all font-zhongsong text-sm flex items-center gap-1"
                                          >
                                            {link}
                                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* 回答参考链接（客观题权威资料） */}
                                {item.answer_references && item.answer_references.length > 0 && (
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <BookOpen className="w-4 h-4 text-green-400" />
                                      <span className="text-white/80 font-zhongsong">回答参考链接（权威资料）</span>
                                    </div>
                                    <ul className="space-y-1">
                                      {item.answer_references.map((link, idx) => (
                                        <li key={idx}>
                                          <a
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-green-300 hover:text-green-200 underline break-all font-zhongsong text-sm flex items-center gap-1"
                                          >
                                            {link}
                                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveStep(2)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-zhongsong"
                >
                  <ChevronDown className="w-5 h-5" />
                  返回上一步
                </button>
                <button
                  onClick={() => {
                    setShowResults(false)
                    setActiveStep(1)
                    setAnalysisData(null)
                    setFormData({ jd: '', resume: null, supplementary: '', careerPlan: '' })
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-zhongsong glow-effect"
                >
                  <RefreshCw className="w-5 h-5" />
                  重新分析
                </button>
              </div>
            </div>
          )}
        </main>

        {/* 页脚 */}
        <footer className="py-6 text-center">
          <p className="text-white/40 text-sm font-zhongsong">
            Agent Interviewer - AI驱动的智能面试助手
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
