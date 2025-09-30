import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
// Dummy in-memory data store
let pages: { id: number; title: string; content: string }[] = [
    { id: 1, title: 'Home', content: 'Welcome to the homepage.' },
    { id: 2, title: 'About', content: 'About us page.' },
];
const userId = await 
// GET: Return all pages
export async function GET(req: NextRequest) {
    const pages = await prisma.pages.findMany(
        where: { userId}
    )
        
    );
    return NextResponse.json(pages);
}

// POST: Add a new page
export async function POST(req: NextRequest) {
    const body = await req.json();
    const newPage = {
        id: pages.length + 1,
        title: body.title || 'Untitled',
        content: body.content || '',
    };
    pages.push(newPage);
    return NextResponse.json(newPage, { status: 201 });
}