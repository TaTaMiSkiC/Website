async getOrderItems(orderId: number): Promise<OrderItemWithProduct[]> {
  try {
    // Prvo dohvati sve stavke narudžbe
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    
    // Dohvati podatke o proizvodima za svaku stavku
    const result = await Promise.all(
      items.map(async (item) => {
        // Dohvati proizvod
        const [product] = await db.select().from(products).where(eq(products.id, item.productId));
        
        // Ako proizvod postoji, koristi njegove podatke, inače koristi podatke iz narudžbe
        const productData = product || {
          id: item.productId,
          name: item.productName || "Proizvod nije dostupan",
          description: "",
          price: "0",
          categoryId: 0,
          imageUrl: null,
          featured: false,
          inventory: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Vrati stavku s podacima o proizvodu
        return {
          ...item,
          product: productData,
          selectedScent: item.scentName,
          selectedColor: item.colorName
        };
      })
    );
    
    return result;
  } catch (error) {
    console.error(`Greška prilikom dohvaćanja stavki narudžbe: ${error}`);
    return [];
  }
}