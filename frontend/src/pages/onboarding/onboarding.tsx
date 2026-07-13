import { $appConfig } from '@common/globalStates'
import onboardingImage1 from '@resource/img/apps/onboarding-image-1.webp'
import onboardingImage2 from '@resource/img/apps/onboarding-image-2.webp'
import customizedRequiredMark from '@utilities/customized-required-mark'
import { Form, Progress, theme } from 'antd'
import { useAtomValue } from 'jotai'
import { type ReactNode, useEffect, useState } from 'react'
import { Navigate } from 'react-router'

import useSaveOnboarding from './data/use-save-onboarding'
import StepBusinessInfo from './ui/step-business-info'
import StepInstallPlugins, { DEFAULT_PLUGIN_SLUGS } from './ui/step-install-plugins'

const INITIAL_VALUES = { plugins: DEFAULT_PLUGIN_SLUGS }

const STEPS = [
  { image: onboardingImage1, key: 'business' },
  { image: onboardingImage2, key: 'plugins' }
] as const

export interface OnboardingType {
  email?: string
  name?: string
  plugins: string[]
}

export default function Onboarding() {
  const { onboardingCompleted } = useAtomValue($appConfig)
  const [form] = Form.useForm<OnboardingType>()
  const [currentStep, setCurrentStep] = useState(0)
  const advance = () => setCurrentStep(step => Math.min(step + 1, STEPS.length - 1))
  const goBack = () => setCurrentStep(step => Math.max(step - 1, 0))
  const { isSavingOnboarding, saveOnboarding } = useSaveOnboarding()
  const { token } = theme.useToken()

  useEffect(() => {
    document.body.classList.add('bit-crm-onboarding-fullscreen')
    window.scrollTo(0, 0)

    return () => {
      document.body.classList.remove('bit-crm-onboarding-fullscreen')
    }
  }, [])

  const handleFinish = async () => {
    const { email, name, plugins = [] } = form.getFieldsValue(true)
    await saveOnboarding({ email, name, plugins })
  }

  const stepContent: Record<(typeof STEPS)[number]['key'], ReactNode> = {
    business: <StepBusinessInfo form={form} onNext={advance} />,
    plugins: (
      <StepInstallPlugins finishing={isSavingOnboarding} onBack={goBack} onFinish={handleFinish} />
    )
  }

  const percent = Math.round(((currentStep + 1) / STEPS.length) * 100)
  const activeStep = STEPS[currentStep]

  if (onboardingCompleted) {
    return <Navigate replace to="/" />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="flex w-full max-w-[880px] flex-col gap-6">
        <div className="px-2">
          <Progress percent={percent} showInfo={false} strokeColor={token.colorPrimary} />
        </div>

        <Form
          form={form}
          initialValues={INITIAL_VALUES}
          layout="vertical"
          preserve
          requiredMark={customizedRequiredMark}
        >
          <div className="grid h-full grid-cols-2 gap-[35px] rounded-[20px] bg-white p-[35px]">
            <img alt="" className="min-h-full w-full" src={activeStep.image} />
            <div className="flex min-h-full flex-col px-2 py-3">
              {STEPS.map((step, index) => (
                <div
                  className={index === currentStep ? 'flex h-full flex-col' : 'hidden'}
                  key={step.key}
                >
                  {stepContent[step.key]}
                </div>
              ))}
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}
