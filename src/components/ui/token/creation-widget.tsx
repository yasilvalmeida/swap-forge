import Image from 'next/image';

export interface TokenCreateWidgetProps {
  publicKey: string;
  name: string;
  symbol: string;
  supply: string;
  decimals: string;
  logo: string;
}

export const TokenCreateWidget = ({ name, symbol, supply, decimals, logo }: TokenCreateWidgetProps) => {
  return <div className="flex flex-row gap-3 text-gray-100">
    <div className='relative flex justify-start'>
      <Image
        src={logo}
        alt='logo'
        width={200}
        height={200}
        className='rounded-md'
      />
    </div>
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-1">
        <span>Name</span>
        <span>{ name }</span>
      </div>
      <div className="flex flex-row gap-1">
        <span>Symbol</span>
        <span>{ symbol }</span>
      </div>
      <div className="flex flex-row gap-1">
        <span>Decimals</span>
        <span>{ decimals }</span>
      </div>
      <div className="flex flex-row gap-1">
        <span>Supply</span>
        <span>{ supply }</span>
      </div>
    </div>
  </div>
}