const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.json({ message: 'test' });
});

app.get('/scrape', async (req, res) => {
  const query = req.query.query || 'lessive';
  const limit = req.query.limit || 6;

  try {
    const result = await crawlSite(query, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: `Erreur lors de la récupération des données : ${error.message}` });
  }
});

async function crawlSite(query, limit) {
  const url = `https://www.amazon.fr/s?k=${encodeURIComponent(query)}&ref=nb_sb_noss`;
  const productsData = [];

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const products = $('div.s-result-item').slice(0, limit);

    products.each((index, element) => {
      const productName = $(element).find('span.a-text-normal').text().trim();
      
      let productPromoPrice = $(element).find('span.a-offscreen').first().text().trim();
      let productOriginalPrice = $(element).find('span.a-price span.a-offscreen').last().text().trim();

      // Vérifier si le prix de promotion n'est pas trouvé dans la structure précédente
      if (!productPromoPrice) {
        // Essayer une autre structure pour le prix de promotion
        productPromoPrice = $(element).find('span.s-price span.a-offscreen').first().text().trim();
      }

      const productImage = $(element).find('img.s-image').attr('src');

      // Ajouter les informations sur le produit à l'array
      productsData.push({
        productName,
        productPromoPrice,
        productOriginalPrice,
        productImage,
      });
    });

    return productsData; // Retourner l'array de produits
  } catch (error) {
    console.error(`Erreur lors de la récupération du site Amazon : ${error.message}`);
    throw error;
  }
}

app.get('/scrape-carrefour', async (req, res) => {
    const query = req.query.query || 'lessive';
    const limit = req.query.limit || 6;
  
    try {
      const result = await crawlCarrefour(query, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: `Erreur lors de la récupération des données : ${error.message}` });
    }
  });
  
//   async function crawlCarrefour(query, limit) {
//     const url = `https://www.carrefour.fr/s?q=${encodeURIComponent(query)}`;
//     const productsData = [];
  
//     try {
//       // Utilisez un en-tête User-Agent valide pour simuler une demande de navigateur
//       const response = await axios.get(url, {
//         headers: {
//           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:97.0) Gecko/20100101 Firefox/97.0',
//         },
//       });
  
//       const $ = cheerio.load(response.data);
//       const products = $('.product-selector-class').slice(0, limit); // Remplacez par le sélecteur CSS approprié
  
//       products.each((index, element) => {
//         const productName = $(element).find('.product-name-class').text().trim(); // Remplacez par le sélecteur CSS approprié
//         const productPrice = $(element).find('.product-price-class').text().trim(); // Remplacez par le sélecteur CSS approprié
//         const productImage = $(element).find('.product-image-class').attr('src'); // Remplacez par le sélecteur CSS approprié
  
//         // Ajouter les informations sur le produit à l'array
//         productsData.push({
//           productName,
//           productPrice,
//           productImage,
//         });
//       });
  
//       return productsData; // Retourner l'array de produits
//     } catch (error) {
//       console.error(`Erreur lors de la récupération du site Carrefour : ${error.message}`);
//       throw error;
//     }
//   }

  async function crawlCarrefour(query, limit) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    // Simuler une requête de navigateur
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:97.0) Gecko/20100101 Firefox/97.0');
   // await page.goto(`https://www.carrefour.fr/s?q=${encodeURIComponent(query)}`);
    await page.goto('https://www.carrefour.fr/s?q=coca');
  
    // Attendre le chargement des données dynamiques (si nécessaire)
    await page.waitForSelector('.product-selector-class');
  
    // Extraire les données de la page avec Puppeteer
    const productsData = await page.evaluate(() => {
      const products = document.querySelectorAll('.product-selector-class'); // Remplacez par le sélecteur CSS approprié
      const data = [];
  
      products.forEach((element) => {
        const productName = element.querySelector('.product-name-class').textContent.trim(); // Remplacez par le sélecteur CSS approprié
        const productPrice = element.querySelector('.product-price-class').textContent.trim(); // Remplacez par le sélecteur CSS approprié
        const productImage = element.querySelector('.product-image-class').getAttribute('src'); // Remplacez par le sélecteur CSS approprié
  
        data.push({
          productName,
          productPrice,
          productImage,
        });
      });
  
      return data;
    });
  
    await browser.close();
  
    return productsData;
  }

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
