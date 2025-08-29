import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🚀 API Route iniciada');
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Extrair parâmetros da query string
    const year = searchParams.get('year') || '2023';
    const limitParam = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';
    const language = searchParams.get('language');
    // discipline é ignorado - será filtrado localmente

    // Validar e limitar o parâmetro limit (máximo 50 conforme API)
    const limit = Math.min(parseInt(limitParam), 50).toString();

    console.log('🔗 Proxy recebeu parâmetros:', { year, limit, offset, language });

    // Construir URL da API externa - apenas com parâmetros suportados
    let apiUrl = `https://api.enem.dev/v1/exams/${year}/questions?limit=${limit}&offset=${offset}`;
    
    // Adicionar language apenas se fornecido e válido
    if (language && (language === 'ingles' || language === 'espanhol')) {
      apiUrl += `&language=${language}`;
    }
    
    console.log('🔗 URL da API externa:', apiUrl);

    // Fazer requisição simples
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    console.log('📡 Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da API externa:', response.status, errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Dados recebidos:', { 
      questionsCount: data.questions?.length || 0,
      metadata: data.metadata 
    });

    // Validar estrutura básica
    if (!data.metadata || !Array.isArray(data.questions)) {
      console.error('❌ Estrutura inválida:', data);
      throw new Error('Estrutura de resposta inválida');
    }

    // Retornar dados com headers CORS
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('❌ Erro na API route:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro ao buscar questões',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
