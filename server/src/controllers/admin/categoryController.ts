import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import slugify from "slugify"; // ✅ Import slugify library

const prisma = new PrismaClient();

/** 🔹 Utility function to generate a unique slug */
const generateUniqueSlug = async (name: string): Promise<string> => {
	let baseSlug = slugify(name, { lower: true, strict: true }); // Convert name to slug
	let slug = baseSlug;
	let count = 1;

	// Check if the slug already exists in the database
	while (await prisma.productCategory.findUnique({ where: { slug } })) {
		slug = `${baseSlug}-${count++}`; // Append a number if it already exists
	}

	return slug;
};

/** 🔹 CREATE CATEGORY */
export const createCategory = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		let { name, slug, parentId } = req.body;

		if (!name) {
			res.status(400).json({ message: "Name is required" });
			return;
		}

		// Generate slug if not provided
		if (!slug) {
			slug = await generateUniqueSlug(name);
		}

		const category = await prisma.productCategory.create({
			data: {
				name,
				slug,
				parentId: parentId || null, // Assign parent if provided
			},
		});

		res.status(201).json(category);
	} catch (error) {
		console.error("Error creating category:", error);
		res.status(500).json({ message: "Error creating category" });
	}
};

/** 🔹 UPDATE CATEGORY */
export const updateCategory = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {

		const { id } = req.params;
		const {
			name,
			slug,
			parentId,
			description,
			metaTitle,
			metaDescription,
			metaKeywords,
		} = req.body;

		// Check if category exists
		const category = await prisma.productCategory.findUnique({
			where: { id: Number(id) },
		});
		if (!category) {
			res.status(404).json({ message: "Category not found" });
			return;
		}

		// Update category
		const updatedCategory = await prisma.productCategory.update({
			where: { id: Number(id) },
			data: {
				name,
				slug,
				parentId: parentId || null,
				description,
				metaTitle,
				metaDescription,
				metaKeywords,
			},
		});

		res.status(200).json(updatedCategory);
	} catch (error) {
		console.error("Error updating category:", error);
		res.status(500).json({ message: "Error updating category" });
	}
};

/** 🔹 DELETE CATEGORY */
export const deleteCategory = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;

		// Check if category exists
		const category = await prisma.productCategory.findUnique({
			where: { id: Number(id) },
		});
		if (!category) {
			res.status(404).json({ message: "Category not found" });
			return;
		}

		// Delete the category
		await prisma.productCategory.delete({ where: { id: Number(id) } });

		res.status(200).json({ message: "Category deleted successfully" });
	} catch (error) {
		console.error("Error deleting category:", error);
		res.status(500).json({ message: "Error deleting category" });
	}
};

/** 🔹 GET CATEGORY BY ID */
export const getCategoryById = async (
	req: Request,
	res: Response
): Promise<void> => {
	const { id } = req.params;

	const category = await prisma.productCategory.findUnique({
		where: { id: Number(id) },
	});

	if (!category) {
		res.status(404).json({ message: "Category not found" });
		return;
	}

	res.status(200).json(category);
};
