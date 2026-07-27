import { $appConfig } from '@common/globalStates'
import onboardingImage1 from '@resource/img/apps/onboarding-image-1.webp'
import onboardingImage2 from '@resource/img/apps/onboarding-image-2.webp'
import customizedRequiredMark from '@utilities/customized-required-mark'
import { Form, Progress, theme } from 'antd'
import { useAtomValue } from 'jotai'
import { type ReactNode, useEffect, useRef, useState } from 'react'
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
  const { isDarkTheme, onboardingCompleted } = useAtomValue($appConfig)
  const [form] = Form.useForm<OnboardingType>()
  const [currentStep, setCurrentStep] = useState(0)
  const advance = () => setCurrentStep(step => Math.min(step + 1, STEPS.length - 1))
  const goBack = () => setCurrentStep(step => Math.max(step - 1, 0))
  const { isSavingOnboarding, saveOnboarding } = useSaveOnboarding()
  const { token } = theme.useToken()
  const stepHeadingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.classList.add('bit-crm-onboarding-fullscreen')
    window.scrollTo(0, 0)

    return () => {
      document.body.classList.remove('bit-crm-onboarding-fullscreen')
    }
  }, [])

  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkTheme])

  useEffect(() => {
    stepHeadingRef.current?.focus()
  }, [currentStep])

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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 sm:p-6 dark:bg-neutral-950">
      <div className="flex w-full max-w-[880px] flex-col sm:gap-6">
        <div className="flex flex-col gap-1">
          <Progress percent={percent} showInfo={false} strokeColor={token.colorPrimary} />
        </div>

        <Form
          form={form}
          initialValues={INITIAL_VALUES}
          layout="vertical"
          preserve
          requiredMark={customizedRequiredMark}
        >
          <div className="grid h-full grid-cols-1 gap-6 rounded-[20px] bg-white p-6 md:grid-cols-2 md:gap-[35px] md:p-[35px] dark:bg-neutral-900">
            <img
              alt={activeStep.key}
              className="hidden w-full rounded-[14px] object-cover md:block md:min-h-full"
              src={activeStep.image}
            />
            <div className="flex min-h-full flex-col md:px-2 md:py-3">
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
