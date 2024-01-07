const axios = require('axios');
const cheerio = require('cheerio');

async function crawlAmazon(query, limit) {
  const url = `https://www.amazon.fr/s?k=${encodeURIComponent(query)}&ref=nb_sb_noss`;

  try {
    // Effectuer une requête HTTP pour récupérer le contenu du site
    const response = await axios.get(url);

    // Utiliser Cheerio pour charger le contenu HTML
    const $ = cheerio.load(response.data);

    // Rechercher les éléments HTML contenant les informations sur les produits
    const products = $('div.s-result-item').slice(0, limit);

    products.each((index, element) => {
      // Extraire les informations sur le produit (nom, prix, image, etc.)
      const productName = $(element).find('span.a-text-normal').text().trim();
      const productPrice = $(element).find('span.a-offscreen').text().trim();
      const productImage = $(element).find('img.s-image').attr('src');

      // Afficher les informations sur le produit
      console.log(`Produit: ${productName}`);
      console.log(`Prix: ${productPrice}`);
      console.log(`Image: ${productImage}`);
      console.log('-------------------');
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération du site Amazon : ${error.message}`);
  }
}

// Appeler la fonction avec la requête "lessive" et limiter à 6 produits
const searchQuery = 'lessive';
const productLimit = 6;
crawlAmazon(searchQuery, productLimit);
