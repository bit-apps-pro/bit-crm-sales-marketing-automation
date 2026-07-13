const customizedRequiredMark = (label: React.ReactNode, { required }: { required: boolean }) => (
  <>
    <span className="flex items-center justify-start gap-[2px]">
      {label}
      {required && <span className="text-base text-red-500">*</span>}
    </span>
  </>
)

export default customizedRequiredMark
