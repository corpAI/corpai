import { CheckCircle, XCircle, ShieldCheck } from 'lucide-react'

const ProblemSolutions = () => {
  return (
    <section id="problem-solution" className="bg-gray-50 py-16">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-4xl font-bold text-gray-900">
          Challenges Enterprises Face
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Enterprises struggle with fragmented data, high operational costs, and
          slow AI adoption.
          <br />
          CorpAI provides a seamless AI-driven transformation.
        </p>
      </div>
      {/* Problems and Solutions */}
      <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-2">
        {/* Problem Statements */}
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h3 className="text-2xl font-semibold text-gray-800">
            🚨 The Challenges
          </h3>
          <div className="mt-6 space-y-6">
            <div className="flex items-start space-x-4">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <h4 className="text-lg font-semibold text-gray-800">
                  Data Silos & Complexity
                </h4>
                <p className="text-gray-600">
                  The core of any digital enterprise is its data. However, data
                  sources are varied and still siloed, requiring heavy
                  investments in infrastructure.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <h4 className="text-lg font-semibold text-gray-800">
                  Fragmented Enterprise Applications
                </h4>
                <p className="text-gray-600">
                  Enterprises rely on multiple applications (HRM, CRM, IT,
                  Analytics), now evolving into agentic AI solutions, shifting
                  away from traditional UI/API methods.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <h4 className="text-lg font-semibold text-gray-800">
                  AI Governance & Compliance Risks
                </h4>
                <p className="text-gray-600">
                  Enterprises are yet to fully adopt AI technologies due to
                  concerns over security, compliance, and governance risks.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Solutions by CorpAI */}
        <div className="rounded-lg bg-blue-600 p-8 text-white shadow-md">
          <h3 className="text-2xl font-semibold">✅ How CorpAI Solves This</h3>
          <div className="mt-6 space-y-6">
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-8 w-8 text-white" />
              <div>
                <h4 className="text-lg font-semibold">
                  AI-Driven Data Transformation
                </h4>
                <p>
                  CorpAI enables enterprises to transition from data-driven
                  sources to AI-powered data ecosystems, enhancing efficiency.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-8 w-8 text-white" />
              <div>
                <h4 className="text-lg font-semibold">
                  Unified AI Agent Interface
                </h4>
                <p>
                  CorpAI provides a single interface for employees to interact
                  seamlessly with enterprise applications and data sources.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <ShieldCheck className="h-8 w-8 text-white" />
              <div>
                <h4 className="text-lg font-semibold">
                  Secure & Compliant AI Governance
                </h4>
                <p>
                  CorpAI ensures AI adoption is safe, secure, and compliant by
                  providing governance frameworks and risk management solutions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center">
        <h3 className="text-2xl font-bold text-gray-900">
          Ready to transform your enterprise with AI?
        </h3>
        <p className="mt-2 text-lg text-gray-600">
          <a href="#contact-us"><b><i>Contact us</i></b></a> today to explore how CorpAI can revolutionize your
          organization.
        </p>
        
      </div>
    </section>
  )
}

export default ProblemSolutions
