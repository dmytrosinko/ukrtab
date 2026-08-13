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

async function sendTelegramNotification(order: any, requestOrigin?: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('Telegram notification skipped: missing env vars', {
      hasToken: !!token,
      hasChatId: !!chatId,
    });
    return { success: false, reason: 'missing_env_vars', hasToken: !!token, hasChatId: !!chatId };
  }

  try {
    const escapeHtml = (str: string) =>
      str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const itemsList = (order.items || [])
      .map((item: any) => `• ${escapeHtml(item.productName)} (${item.quantity} x ${item.price} ₴)`)
      .join('\n');

    const rawSiteUrl =
      requestOrigin ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://ukrtab.prom.ua');

    const siteUrl = rawSiteUrl.replace(/\/+$/, '');
    const adminOrderUrl = `${siteUrl}/admin/orders#order-${order.orderNumber}`;

    const message =
      `🛍 <b>НОВЕ ЗАМОВЛЕННЯ #${order.orderNumber}</b>\n\n` +
      `👤 <b>Клієнт:</b> ${escapeHtml(order.customerName)}\n` +
      `📞 <b>Телефон:</b> ${escapeHtml(order.customerPhone)}\n` +
      `${order.customerEmail ? `✉️ <b>Email:</b> ${escapeHtml(order.customerEmail)}\n` : ''}` +
      `📍 <b>Місто:</b> ${escapeHtml(order.city || 'Не вказано')}\n` +
      `🚚 <b>Доставка:</b> ${escapeHtml(order.deliveryMethod)} (${escapeHtml(order.warehouseInfo || 'без адреси')})\n` +
      `💳 <b>Оплата:</b> ${escapeHtml(order.paymentMethod)}\n` +
      `${order.notes ? `📝 <b>Примітка (коментар):</b> ${escapeHtml(order.notes)}\n` : ''}\n` +
      `📦 <b>Товари:</b>\n${itemsList}\n\n` +
      `💰 <b>Разом:</b> ${order.total} ₴\n\n` +
      `🔗 <a href="${adminOrderUrl}"><b>Відкрити в адмінці</b></a>`;

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const resData = await res.json();
    console.log('Telegram API response:', resData);
    return { success: resData.ok, data: resData };
  } catch (err: any) {
    console.error('Failed to send Telegram notification:', err);
    return { success: false, error: err?.message || err };
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
    const hostHeader = request.headers.get('host') || request.headers.get('x-forwarded-host');
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const originUrl = hostHeader ? `${protocol}://${hostHeader}` : undefined;
    const telegramResult = await sendTelegramNotification(order, originUrl);

    return NextResponse.json({ ...order, telegramResult }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
