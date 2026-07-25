import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      city,
      deliveryMethod,
      warehouseInfo,
      paymentMethod,
      notes,
      items,
    } = body;

    if (!customerName || !customerPhone || !items || !items.length) {
      return NextResponse.json(
        { error: 'Customer name, phone, and items are required' },
        { status: 400 }
      );
    }

    const total = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Get max orderNumber
    const lastOrder = await prisma.order.findFirst({
      orderBy: { orderNumber: 'desc' },
    });
    const nextOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1001;

    const order = await prisma.order.create({
      data: {
        orderNumber: nextOrderNumber,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        city: city || null,
        deliveryMethod: deliveryMethod || 'Нова Пошта',
        warehouseInfo: warehouseInfo || null,
        paymentMethod: paymentMethod || 'При отриманні',
        notes: notes || null,
        total,
        items: {
          create: items.map((item: any) => ({
            productId: item.product?.id || item.productId || null,
            productName: item.product?.name || item.productName || 'Товар',
            price: item.price || item.product?.price || 0,
            quantity: item.quantity || 1,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
