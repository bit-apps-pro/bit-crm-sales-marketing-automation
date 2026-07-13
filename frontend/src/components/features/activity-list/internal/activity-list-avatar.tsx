import { LuCalendarDays, LuClipboardCheck, LuPhoneCall } from 'react-icons/lu'

const generateAvatar = (activityType: string) => {
  if (activityType === 'call') {
    return <LuPhoneCall size={20} />
  }

  if (activityType === 'meeting') {
    return <LuCalendarDays size={20} />
  }

  return <LuClipboardCheck size={20} />
}

export default function ActivityListAvatar({ activityType }: { activityType: string }) {
  return <span>{generateAvatar(activityType)}</span>
}
