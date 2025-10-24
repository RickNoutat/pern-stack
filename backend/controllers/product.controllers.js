import { sql } from "../config/db.js";

export const getProducts = async (req, res) => {
  try {
    const products = await sql`
    SELECT * FROM products
    ORDER BY created_at DESC
    `;
    console.log("fetched products", products);
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.log("Error fetching products", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createProduct = async (req, res) => {
  const { name, price, image } = req.body;
  if (!name || !price || !image) {
    res.status(400).json({
      success: false,
      message: "Please provide all the required fields",
    });
  }
  try {
    const newProduct = await sql`
    INSERT INTO products (name, price, image)
    VALUES (${name}, ${price}, ${image})
    RETURNING *
    `;

    console.log("created product", newProduct);

    res.status(201).json({
      success: true,
      data: newProduct[0],
    });
  } catch (error) {
    console.log("Error creating product", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await sql`
    SELECT * FROM products
    WHERE id = ${id}
    `;
    console.log("fetched product", product);
    if (!product || product.length === 0) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: product[0],
    });
  } catch (error) {
    console.log("Error fetching product", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, image } = req.body;

  if (name === undefined && price === undefined && image === undefined) {
    res.status(400).json({
      success: false,
      message: "Please provide at least one field to update",
    });
    return;
  }

  try {
    const existingProduct = await sql`
    SELECT * FROM products
    WHERE id = ${id}
    `;

    if (!existingProduct || existingProduct.length === 0) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    const currentProduct = existingProduct[0];

    const updatedProduct = await sql`
    UPDATE products
    SET name = ${name ?? currentProduct.name},
        price = ${price ?? currentProduct.price},
        image = ${image ?? currentProduct.image}
    WHERE id = ${id}
    RETURNING *
    `;

    if (!updatedProduct || updatedProduct.length === 0) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    console.log("updated product", updatedProduct);

    res.status(200).json({
      success: true,
      data: updatedProduct[0],
    });
  } catch (error) {
    console.log("Error updating product", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await sql`
    DELETE FROM products
    WHERE id = ${id}
    RETURNING *
    `;

    if (!deletedProduct || deletedProduct.length === 0) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    console.log("deleted product", deletedProduct);

    res.status(200).json({
      success: true,
      data: deletedProduct[0],
    });
  } catch (error) {
    console.log("Error deleting product", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
