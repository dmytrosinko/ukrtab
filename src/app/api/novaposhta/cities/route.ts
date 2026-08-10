import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (!query.trim()) {
    return NextResponse.json({ cities: [] });
  }

  const apiKey = process.env.NOVA_POSHTA_API_KEY || '';

  try {
    const res = await fetch('https://api.novaposhta.ua/v2.0/json/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        modelName: 'Address',
        calledMethod: 'searchSettlements',
        methodProperties: {
          CityName: query.trim(),
          Limit: '25',
          Page: '1',
        },
      }),
      // Cache query for performance or revalidate
      next: { revalidate: 3600 },
    });

    const data = await res.json();

    if (!data.success || !data.data || !data.data[0]) {
      return NextResponse.json({ cities: [], rawError: data.errors });
    }

    const addresses = data.data[0].Addresses || [];
    const formattedCities = addresses.map((item: any) => ({
      ref: item.DeliveryCity || item.Ref,
      settlementRef: item.Ref,
      name: item.MainDescription || item.Present,
      present: item.Present,
      area: item.AreaDescription || '',
      region: item.RegionsDescription || '',
      settlementType: item.SettlementTypeCode || '',
    }));

    return NextResponse.json({ cities: formattedCities });
  } catch (error: any) {
    console.error('Error fetching Nova Poshta cities:', error);
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
  }
}
