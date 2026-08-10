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

async function sendTelegramNotification(order: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    const itemsList = (order.items || [])
      .map((item: any) => `• ${item.productName} (${item.quantity} x ${item.price} ₴)`)
      .join('\n');

    const message =
      `🛍 *НОВЕ ЗАМОВЛЕННЯ #${order.orderNumber}*\n\n` +
      `👤 *Клієнт:* ${order.customerName}\n` +
      `📞 *Телефон:* ${order.customerPhone}\n` +
      `${order.customerEmail ? `✉️ *Email:* ${order.customerEmail}\n` : ''}` +
      `📍 *Місто:* ${order.city || 'Не вказано'}\n` +
      `🚚 *Доставка:* ${order.deliveryMethod} (${order.warehouseInfo || 'без адреси'})\n` +
      `💳 *Оплата:* ${order.paymentMethod}\n` +
      `${order.notes ? `📝 *Примітка:* ${order.notes}\n` : ''}\n` +
      `📦 *Товари:*\n${itemsList}\n\n` +
      `💰 *Разом:* ${order.total} ₴`;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });
  } catch (err) {
    console.error('Failed to send Telegram notification:', err);
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
      (sum: number, item: any) =>
        sum +
        (Number(item.price) || Number(item.product?.price) || 0) *
          (Number(item.quantity) || 1),
      0
    );

    // Get max orderNumber safely
    let nextOrderNumber = 1001;
    try {
      const lastOrder = await prisma.order.findFirst({
        orderBy: { orderNumber: 'desc' },
      });
      if (lastOrder && typeof lastOrder.orderNumber === 'number') {
        nextOrderNumber = lastOrder.orderNumber + 1;
      }
    } catch (err) {
      console.warn('Could not query last orderNumber:', err);
    }

    // Collect candidate product IDs and check which actually exist in DB
    const rawProductIds = items
      .map((item: any) => item.product?.id || item.productId)
      .filter(
        (id: any) => typeof id === 'string' && id && !id.startsWith('custom-')
      );

    let validProductIds = new Set<string>();
    if (rawProductIds.length > 0) {
      try {
        const found = await prisma.product.findMany({
          where: { id: { in: rawProductIds } },
          select: { id: true },
        });
        validProductIds = new Set(found.map((p) => p.id));
      } catch (err) {
        console.warn('Could not verify existing product IDs:', err);
      }
    }

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
          create: items.map((item: any) => {
            const rawId = item.product?.id || item.productId || null;
            const productId = rawId && validProductIds.has(rawId) ? rawId : null;
            const productName =
              item.product?.name || item.productName || item.title || 'Товар';
            const price = Number(item.price || item.product?.price || 0);
            const quantity = Number(item.quantity || 1);

            return {
              productId,
              productName,
              price,
              quantity,
            };
          }),
        },
      },
      include: { items: true },
    });

    // Notify Telegram if token/chatId are configured
    sendTelegramNotification(order);

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
