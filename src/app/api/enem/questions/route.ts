import { NextRequest, NextResponse } from 'next/server';

const ENEM_API_BASE = 'https://api.enem.dev/v1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extrair parâmetros da query string
    const year = searchParams.get('year') || '2023';
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';
    const language = searchParams.get('language');
    const discipline = searchParams.get('discipline');

    // Construir URL da API externa
    const apiUrl = new URL(`${ENEM_API_BASE}/exams/${year}/questions`);
    apiUrl.searchParams.set('limit', limit);
    apiUrl.searchParams.set('offset', offset);
    
    if (language) apiUrl.searchParams.set('language', language);
    if (discipline) apiUrl.searchParams.set('discipline', discipline);

    console.log('🔗 Proxy fazendo requisição para:', apiUrl.toString());

    // Fazer requisição para a API externa
    const response = await fetch(apiUrl.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Estuda-Zatto/3.0',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Dados recebidos da API:', { questionsCount: data.questions?.length || 0 });

    // Retornar dados com headers CORS apropriados
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('❌ Erro no proxy da API ENEM:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro ao buscar questões',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
