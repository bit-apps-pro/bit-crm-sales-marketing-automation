import { __ } from '@common/helpers/i18nWrap'
import greeting from '@resource/img/home.svg'
import { Link } from 'react-router'

export default function Welcome() {
  return (
    <div className="btcd-greeting">
      <img alt="" src={greeting} />
      <h2>{__('Welcome to Bit Flow', 'bit-crm')}</h2>
      <div className="sub">{__('Thank you for installing Bit Flow.', 'bit-crm')}</div>
      <Link className="btn round btcd-btn-lg dp-blue" to="../flow/new">
        {__('Create Integration', 'bit-crm')}
      </Link>
    </div>
  )
}
