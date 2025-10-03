import React from 'react'

type Props = {}

const BioPage = (props: Props) => {
    const { subdomain } = props; // Adjust based on how you pass the subdomain prop
  return (
    <div>Bio Page for {subdomain}</div>
  )
}