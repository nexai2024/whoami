import React from 'react'

type Props = {
    sudomain: string;
}

const BioPage = (props: Props) => {
    const { sudomain } = props; // Adjust based on how you pass the subdomain prop
  return (
    <div>Bio Page for {sudomain}</div>
  )
}
export default BioPage;