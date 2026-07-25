const fs = require('fs');

async function scrapeAll() {
  const allProducts = [];
  const seenUrls = new Set();

  for (let page = 1; page <= 10; page++) {
    const url = `https://ukrtab.prom.ua/ua/product_list/page_${page}`;
    console.log(`Fetching ${url}...`);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`Page ${page} status ${res.status}, stopping.`);
        break;
      }
      const text = await res.text();
      
      // Extract LD+JSON Product blocks
      const matches = text.match(/<script type="application\/ld\+json">(.*?)<\/script>/gs);
      if (!matches) {
        console.log(`No json-ld on page ${page}`);
        break;
      }

      let countOnPage = 0;
      for (const m of matches) {
        const jsonStr = m.replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, '');
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed['@type'] === 'Product') {
            const productUrl = parsed.offers?.url || '';
            if (productUrl && !seenUrls.has(productUrl)) {
              seenUrls.add(productUrl);
              allProducts.push(parsed);
              countOnPage++;
            }
          }
        } catch (e) {}
      }

      console.log(`Page ${page}: found ${countOnPage} new products. Total so far: ${allProducts.length}`);
      if (countOnPage === 0) {
        console.log(`0 new products on page ${page}, stopping.`);
        break;
      }
    } catch (e) {
      console.error(`Error on page ${page}:`, e);
      break;
    }
  }

  console.log(`\nTOTAL UNIQUE PRODUCTS SCRAPED: ${allProducts.length}`);
  fs.writeFileSync('./scraped_prom_full.json', JSON.stringify(allProducts, null, 2));
}

scrapeAll();
