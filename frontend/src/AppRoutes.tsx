import { StyleProvider } from '@ant-design/cssinjs'
import CAPABILITIES from '@common/constants/capabilities'
import NotifyContext from '@common/context/NotifyContext'
import { $appConfig } from '@common/globalStates'
import $navigate from '@common/globalStates/$navigate'
import { createAntDesignStyleContainer } from '@common/helpers/themeUtils'
import { useAppEssentials } from '@common/hooks/use-app-essentials'
import {
  componentsTokenDark,
  componentsTokenLight,
  darkThemeConfig,
  lightThemeConfig
} from '@config/theme'
import Layout from '@pages/Layout'
import SettingsLayout from '@pages/settings-layout'
import OnboardingGuard from '@utilities/onboarding-guard/onboarding-guard'
import protectedRouteComponent from '@utilities/protected-route-component'
import { ConfigProvider, message, notification, theme } from 'antd'
import { useAtom, useAtomValue } from 'jotai'
import { lazy, useEffect, useMemo } from 'react'
import { Route, Routes, useNavigate } from 'react-router'

const Root = lazy(() => import('@pages/dashboard'))
const GeneralSettings = lazy(() => import('@pages/general-settings'))
const LeadSettings = lazy(() => import('@pages/lead-settings'))
const CompanySettings = lazy(() => import('@pages/company-settings'))
const LeadCreate = lazy(() => import('@pages/lead-create'))
const Leads = lazy(() => import('@pages/leads'))
const Lead = lazy(() => import('@pages/lead'))
const Companies = lazy(() => import('@pages/companies'))
const CompanyCreate = lazy(() => import('@pages/company-create'))
const Company = lazy(() => import('@pages/company'))
const Tags = lazy(() => import('@pages/tags'))
const History = lazy(() => import('@pages/history'))
const Tasks = lazy(() => import('@pages/tasks'))
const Meetings = lazy(() => import('@pages/meetings'))
const Calls = lazy(() => import('@pages/calls'))
const Error404 = lazy(() => import('@pages/Error404'))
const ImapSettings = lazy(() => import('@pages/imap-settings'))
const Contacts = lazy(() => import('@pages/contacts'))
const Contact = lazy(() => import('@pages/contact'))
const ContactCreate = lazy(() => import('@pages/contact-create'))
const ContactSettings = lazy(() => import('@pages/contact-settings'))
const DealSettings = lazy(() => import('@pages/deal-settings'))
const Deals = lazy(() => import('@pages/deals'))
const Deal = lazy(() => import('@pages/deal'))
const DealCreate = lazy(() => import('@pages/deal-create'))
const ProductSettings = lazy(() => import('@pages/product-settings'))
const Products = lazy(() => import('@pages/products'))
const IntegrationSettings = lazy(() => import('@pages/integration-settings'))
const Currencies = lazy(() => import('@pages/currencies'))
const InvoiceCreate = lazy(() => import('@pages/invoice-create'))
const Invoices = lazy(() => import('@pages/invoices'))
const DataManagement = lazy(() => import('@pages/data-management'))
const Invoice = lazy(() => import('@pages/Invoice'))
const InvoiceEdit = lazy(() => import('@pages/invoice-edit'))
const CrmUsers = lazy(() => import('@pages/crm-users'))
const SmtpSettings = lazy(() => import('@pages/smtp-settings'))
const Onboarding = lazy(() => import('@pages/onboarding'))
const InvoiceSettings = lazy(() => import('@pages/invoice-settings'))

const { darkAlgorithm, defaultAlgorithm } = theme

const styleContainer = createAntDesignStyleContainer()

export default function AppRoutes() {
  const [navigateUrl, setNavigateUrl] = useAtom($navigate)
  const navigate = useNavigate()
  const { isDarkTheme } = useAtomValue($appConfig)
  const themeTokens = isDarkTheme ? darkThemeConfig : lightThemeConfig
  const themeAlgorithm = isDarkTheme ? darkAlgorithm : defaultAlgorithm
  const componentsToken = isDarkTheme ? componentsTokenDark : componentsTokenLight
  const [notificationApi, contextHolderNotification] = notification.useNotification()
  const [messageApi, contextHolderMessage] = message.useMessage()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const notifyContextValue = useMemo(() => ({ messageApi, notificationApi }), [])

  useAppEssentials()

  useEffect(() => {
    if (navigateUrl && navigateUrl !== '') {
      navigate(navigateUrl, { replace: true })
      setNavigateUrl('')
    }
  }, [navigate, navigateUrl, setNavigateUrl])

  const ProtectedRoute = useMemo(() => protectedRouteComponent, [])

  return (
    <StyleProvider container={styleContainer} hashPriority="high" layer>
      <ConfigProvider
        theme={{
          algorithm: themeAlgorithm,
          components: componentsToken,
          token: themeTokens
        }}
      >
        <NotifyContext.Provider value={notifyContextValue}>
          {contextHolderNotification}
          {contextHolderMessage}
          <Routes>
            <Route element={<Onboarding />} path="/onboarding" />
            <Route
              element={
                <OnboardingGuard>
                  <Layout />
                </OnboardingGuard>
              }
              path="/"
            >
              <Route
                element={
                  <ProtectedRoute capability={CAPABILITIES.DASHBOARD}>
                    <Root />
                  </ProtectedRoute>
                }
                index
              />

              <Route
                element={
                  <ProtectedRoute capability={CAPABILITIES.SETTING.MENU}>
                    <SettingsLayout />
                  </ProtectedRoute>
                }
                path="/settings"
              >
                <Route
                  element={
                    <ProtectedRoute capability={CAPABILITIES.SETTING.GENERAL}>
                      <GeneralSettings />
                    </ProtectedRoute>
                  }
                  path="general-settings"
                />
                <Route
                  element={
                    <ProtectedRoute capability={CAPABILITIES.SETTING.LEAD}>
                      <LeadSettings />
                    </ProtectedRoute>
                  }
                  path="lead-settings"
                />
                <Route
                  element={
                    <ProtectedRoute capability={CAPABILITIES.SETTING.COMPANY}>
                      <CompanySettings />
                    </ProtectedRoute>
                  }
                  path="company-settings"
                />
                <Route
                  element={
                    <ProtectedRoute capability={CAPABILITIES.SETTING.DEAL}>
                      <DealSettings />
                    </ProtectedRoute>
                  }
                  path="deal-settings"
                />
                <Route
                  element={
                    <ProtectedRoute capability={CAPABILITIES.SETTING.PRODUCT}>
                      <ProductSettings />
                    </ProtectedRoute>
                  }
                  path="product-settings"
                />
                <Route
                  element={
                    <ProtectedRoute capability={CAPABILITIES.SETTING.DEAL}>
                      <DealSettings />
                    </ProtectedRoute>
                  }
                  path="deal-settings"
                />
                <Route
                  element={
                    <ProtectedRoute capability={CAPABILITIES.SETTING.INVOICE}>
                      <InvoiceSettings />
                    </ProtectedRoute>
                  }
                  path="invoice-settings"
                />
                <Route
                  element={
                    <ProtectedRoute capability={CAPABILITIES.SETTING.CONTACT}>
                      <ContactSettings />
                    </ProtectedRoute>
                  }
                  path="contact-settings"
                />
                <Route
                  element={
                    <ProtectedRoute capability={CAPABILITIES.SETTING.DATA_MANAGEMENT}>
                      <DataManagement />
                    </ProtectedRoute>
                  }
                  path="data-management"
                />
                <Route
                  element={
                    <ProtectedRoute capability={CAPABILITIES.SETTING.CURRENCY}>
                      <Currencies />
                    </ProtectedRoute>
                  }
                  path="currencies"
                />
                <Route
                  element={
                    <ProtectedRoute capability={CAPABILITIES.SETTING.INTEGRATION}>
                      <IntegrationSettings />
                    </ProtectedRoute>
                  }
                  path="integration-settings"
                />
                <Route
                  element={
                    <ProtectedRoute capability={CAPABILITIES.SETTING.IMAP}>
                      <ImapSettings />
                    </ProtectedRoute>
                  }
                  path="imap-settings"
                />
                <Route
                  element={
                    <ProtectedRoute capability={CAPABILITIES.SETTING.IMAP}>
                      <ImapSettings />
                    </ProtectedRoute>
                  }
                  path="imap-settings/:page"
                />
                <Route
                  element={
                    <ProtectedRoute capability={CAPABILITIES.SETTING.SMTP}>
                      <SmtpSettings />
                    </ProtectedRoute>
                  }
                  path="smtp-settings"
                />
                <Route
                  element={
                    <ProtectedRoute capability={CAPABILITIES.SETTING.USER}>
                      <CrmUsers />
                    </ProtectedRoute>
                  }
                  path="crm-users"
                />
              </Route>

              <Route
                element={
                  <ProtectedRoute capability={CAPABILITIES.TAG.MENU}>
                    <Tags />
                  </ProtectedRoute>
                }
                path="/tags"
              />
              <Route
                element={
                  <ProtectedRoute capability={CAPABILITIES.OTHERS.History}>
                    <History />
                  </ProtectedRoute>
                }
                path="/history"
              />
              <Route
                element={
                  <ProtectedRoute capability={CAPABILITIES.LEAD.MENU}>
                    <Tasks />
                  </ProtectedRoute>
                }
                path="/tasks"
              />
              <Route
                element={
                  <ProtectedRoute capability={CAPABILITIES.LEAD.MENU}>
                    <Meetings />
                  </ProtectedRoute>
                }
                path="/meetings"
              />
              <Route
                element={
                  <ProtectedRoute capability={CAPABILITIES.LEAD.MENU}>
                    <Calls />
                  </ProtectedRoute>
                }
                path="/calls"
              />
              <Route
                element={
                  <ProtectedRoute capability={CAPABILITIES.LEAD.MENU}>
                    <Leads />
                  </ProtectedRoute>
                }
                path="/leads"
              />
              <Route
                element={
                  <ProtectedRoute capability={CAPABILITIES.LEAD.VIEW}>
                    <Lead />
                  </ProtectedRoute>
                }
                path="/leads/details/:id"
              />
              <Route
                element={
                  <ProtectedRoute capability={CAPABILITIES.LEAD.CREATE}>
                    <LeadCreate />
                  </ProtectedRoute>
                }
                path="/leads/create"
              />
              <Route
                element={
                  <ProtectedRoute capability={CAPABILITIES.COMPANY.MENU}>
                    <Companies />
                  </ProtectedRoute>
                }
                path="/companies"
              />
              <Route
                element={
                  <ProtectedRoute capability={CAPABILITIES.COMPANY.VIEW}>
                    <Company />
                  </ProtectedRoute>
                }
                path="/companies/details/:id"
              />
              <Route
                element={
                  <ProtectedRoute capability={CAPABILITIES.COMPANY.CREATE}>
                    <CompanyCreate />
                  </ProtectedRoute>
                }
                path="/companies/create"
              />
              <Route
                element={
                  <ProtectedRoute capability={CAPABILITIES.CONTACT.MENU}>
                    <Contacts />
                  </ProtectedRoute>
                }
                path="/contacts"
              />
              <Route
                element={
                  <ProtectedRoute capability={CAPABILITIES.CONTACT.VIEW}>
                    <Contact />
                  </ProtectedRoute>
                }
                path="/contacts/details/:id"
              />
              <Route
                element={
                  <ProtectedRoute capability={CAPABILITIES.CONTACT.CREATE}>
                    <ContactCreate />
                  </ProtectedRoute>
                }
                path="/contacts/create"
              />
              <Route
                element={
                  <ProtectedRoute capability={CAPABILITIES.INVOICE.MENU}>
                    <Invoices />
                  </ProtectedRoute>
                }
                path="/invoices"
              />
              <Route
                element={
                  <ProtectedRoute capability={CAPABILITIES.INVOICE.CREATE}>
                    <InvoiceCreate />
                  </ProtectedRoute>
                }
                path="/invoices/create"
              />
              <Route
                element={
                  <ProtectedRoute capability={CAPABILITIES.DEAL.MENU}>
                    <Deals />
                  </ProtectedRoute>
                }
                path="/deals"
              />
              <Route
                element={
                  <ProtectedRoute capability={CAPABILITIES.DEAL.VIEW}>
                    <Deal />
                  </ProtectedRoute>
                }
                path="/deals/details/:id"
              />
              <Route
                element={
                  <ProtectedRoute capability={CAPABILITIES.DEAL.CREATE}>
                    <DealCreate />
                  </ProtectedRoute>
                }
                path="/deals/create"
              />
              <Route
                element={
                  <ProtectedRoute capability={CAPABILITIES.PRODUCT.MENU}>
                    <Products />
                  </ProtectedRoute>
                }
                path="/products"
              />
              <Route
                element={
                  <ProtectedRoute capability={CAPABILITIES.INVOICE.UPDATE}>
                    <InvoiceEdit />
                  </ProtectedRoute>
                }
                path="/invoices/edit/:id"
              />
              <Route
                element={
                  <ProtectedRoute capability={CAPABILITIES.INVOICE.VIEW}>
                    <Invoice />
                  </ProtectedRoute>
                }
                path="/invoices/details/:id"
              />

              <Route element={<Error404 />} path="*" />
            </Route>
          </Routes>
        </NotifyContext.Provider>
      </ConfigProvider>
    </StyleProvider>
  )
}
