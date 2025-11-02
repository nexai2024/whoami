import React from 'react'
import EnhancedPublicPage from '@/components/EnhancedPublicPage';

type Props = {
    params: Promise<{
        subdomain: string;
    }> };


const BioPage = async ({ params }: Props) => {
    const { subdomain } = await params;
    
    return (
        <EnhancedPublicPage 
            subdomain={subdomain}
            slug={subdomain} // Use subdomain as the slug for now
        />
    )
}

export default BioPage;