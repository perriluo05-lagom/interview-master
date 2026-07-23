import { useState, useEffect } from 'react'
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
  Code2
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
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jd: formData.jd,
          resume: formData.resume ? formData.resume.name : null,
          supplementary: supplementaryFiles.length > 0 
            ? `${formData.supplementary}\n[补充材料附件: ${supplementaryFiles.map(f => f.name).join(', ')}]`
            : formData.supplementary,
          career_plan: formData.careerPlan,
          api_key: apiConfig.apiKey || null,
          model: apiConfig.model,
          provider: apiConfig.provider,
          custom_base_url: apiConfig.customBaseUrl
        })
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
      suggestion: '面试官您好，我叫XXX，毕业于XX大学XX专业。过去X年我一直在XX领域工作，主要负责XX方向。在上一段经历中，我主导了XX项目，实现了XX成果。我关注到贵公司正在招聘XX岗位，这与我的职业发展方向高度契合。',
      order: 1
    },
    {
      id: 2,
      question: '请介绍一下你对这个岗位的理解？',
      category: '岗位专业知识',
      difficulty: '中等',
      suggestion: '根据JD，这个岗位主要负责XX工作。我具备X年相关经验，在XX技术方面有深入实践。比如在上一份工作中，我使用XX完成了XX任务，提升了XX指标。',
      order: 2
    },
    {
      id: 3,
      question: '你在简历中提到的XX项目，能详细讲讲吗？',
      category: '简历深挖',
      difficulty: '中等',
      suggestion: '这个项目背景是XX业务面临XX挑战。我的角色是XX，选择了XX方案。过程中遇到XX困难，通过XX方法解决。最终实现了XX成果，数据提升了XX%。',
      order: 3
    },
    {
      id: 4,
      question: '描述一个你遇到的技术难题及解决过程',
      category: '项目经验',
      difficulty: '困难',
      suggestion: '在XX项目中遇到XX难题。我通过XX方式分析根因，调研了XX方案，最终选择XX并实施。问题解决后系统性能提升XX%。',
      order: 4
    },
    {
      id: 5,
      question: '你未来3-5年的职业规划？',
      category: '职业规划',
      difficulty: '中等',
      suggestion: '短期（1年内）：快速融入团队，独立承担XX模块。中期（2-3年）：成为技术骨干，带领小组完成XX项目。长期（3-5年）：向XX方向发展，主导技术决策。',
      order: 5
    },
    {
      id: 6,
      question: '讲述一次你在团队中处理冲突的经历',
      category: '行为面试',
      difficulty: '中等',
      suggestion: '在XX项目中我和同事在方案上有分歧。我没有直接否定，而是约他梳理需求，列出优缺点对比。通过数据分析，他认可了我的方案，我也采纳了他的建议。',
      order: 6
    },
    {
      id: 7,
      question: '你有什么想问我的吗？',
      category: '反问环节',
      difficulty: '简单',
      suggestion: '1）岗位前三个月的主要目标和挑战？2）团队技术栈和架构演进计划？3）岗位的考核标准和成长路径？',
      order: 7
    }
  ]

  // 面试问题按板块分组并排序
  const categoryOrder = ['自我介绍', '岗位专业知识', '简历深挖', '项目经验', '职业规划', '行为面试', '反问环节']
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
              </div>

              {/* 下一步按钮 */}
              <button
                onClick={() => setActiveStep(3)}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-zhongsong text-lg glow-effect hover:scale-[1.02]"
              >
                <Zap className="w-5 h-5" />
                查看面试问题预测
              </button>
            </div>
          )}

          {/* 步骤3：面试问题预测 */}
          {activeStep === 3 && showResults && (
            <div className="space-y-6">
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
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`px-2 py-0.5 rounded text-xs font-zhongsong ${
                                    item.difficulty === '简单' ? 'bg-green-500/20 text-green-300' :
                                    item.difficulty === '中等' ? 'bg-yellow-500/20 text-yellow-300' :
                                    'bg-red-500/20 text-red-300'
                                  }`}>
                                    {item.difficulty}
                                  </span>
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
                              <div className="mt-4 pt-4 border-t border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                  <TrendingUp className="w-4 h-4 text-blue-400" />
                                  <span className="text-white/80 font-zhongsong">参考回答</span>
                                </div>
                                <p className="text-white/70 font-zhongsong leading-relaxed whitespace-pre-wrap">{item.suggestion}</p>
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
