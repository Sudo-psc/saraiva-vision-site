import { NextRequest, NextResponse } from 'next/server';
import { PersonaScorer } from './middleware/utils/scoring.engine';
import { getPersonalizedPath, shouldRewrite } from './middleware/config/routing.config';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public|Blog|img|images).*)',
  ],
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  const personaData = extractPersonaData(request);
  const currentPersona = PersonaScorer.getTopPersona(personaData);
  
  if (shouldRewrite(request.nextUrl.pathname, currentPersona)) {
    const rewritePath = getPersonalizedPath(
      request.nextUrl.pathname,
      currentPersona
    );
    
    return NextResponse.rewrite(new URL(rewritePath, request.url), {
      headers: {
        'X-Persona': currentPersona,
        'X-Original-Path': request.nextUrl.pathname,
      },
    });
  }
  
  response.cookies.set('persona_hint', currentPersona, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30,
  });
  
  response.headers.set('X-Persona', currentPersona);
  
  return response;
}

function extractPersonaData(request: NextRequest): string | undefined {
  return request.cookies.get('persona_hint')?.value;
}
