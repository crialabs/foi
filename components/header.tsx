import Image from "next/image"

export function Header() {
  return (
    <header className="w-full bg-[#6d28d9] py-4">
      <div className="container flex justify-center">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ativo-5-1_310x_1f85aeca-8470-4f4b-aedc-718d644725cd%20%281%29-i4MrDQpYtMqcmvKo68WW8WjnUwrksd.png"
          alt="ATENA Nutrition"
          width={200}
          height={60}
          className="h-auto"
        />
      </div>
    </header>
  )
}
