declare module "next-pwa" {
  type NextPwaOptions = {
    dest: string
    disable?: boolean
    register?: boolean
    skipWaiting?: boolean
  }

  type NextPwaWrapper = <T>(config: T) => T

  export default function withPWA(options: NextPwaOptions): NextPwaWrapper
}
