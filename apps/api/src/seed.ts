import { prisma } from "./prismaClient.js";

type MenuSeed = {
	categoryName: string;
	name: string;
	description: string;
	price: number;
	cost: number;
};

type InventorySeed = {
	sku: string;
	name: string;
	category: string;
	unit: string;
	currentStock: number;
	minStock: number;
	cost: number;
};

const CATEGORY_SEEDS = [
	{ name: "Makanan", sortOrder: 1 },
	{ name: "Minuman", sortOrder: 2 },
	{ name: "Snack", sortOrder: 3 },
];

const MENU_SEEDS: MenuSeed[] = [
	{
		categoryName: "Makanan",
		name: "Nasi Goreng Spesial",
		description: "Nasi goreng dengan telur dan ayam suwir.",
		price: 28000,
		cost: 15000,
	},
	{
		categoryName: "Makanan",
		name: "Mie Goreng Jawa",
		description: "Mie goreng bumbu jawa dengan sayuran segar.",
		price: 24000,
		cost: 13000,
	},
	{
		categoryName: "Minuman",
		name: "Es Teh Manis",
		description: "Teh melati dingin dengan gula aren.",
		price: 8000,
		cost: 3000,
	},
	{
		categoryName: "Minuman",
		name: "Kopi Susu Aren",
		description: "Kopi espresso dengan susu segar dan gula aren.",
		price: 18000,
		cost: 9000,
	},
	{
		categoryName: "Snack",
		name: "Kentang Goreng",
		description: "Kentang goreng renyah dengan saus sambal.",
		price: 16000,
		cost: 7000,
	},
	{
		categoryName: "Snack",
		name: "Pisang Goreng Cokelat",
		description: "Pisang goreng crispy topping cokelat.",
		price: 14000,
		cost: 6000,
	},
];

const INVENTORY_SEEDS: InventorySeed[] = [
	{
		sku: "INV-RICE-001",
		name: "Beras Premium",
		category: "Bahan Pokok",
		unit: "kg",
		currentStock: 25,
		minStock: 10,
		cost: 14500,
	},
	{
		sku: "INV-TEA-001",
		name: "Teh Melati",
		category: "Minuman",
		unit: "pack",
		currentStock: 18,
		minStock: 6,
		cost: 32000,
	},
	{
		sku: "INV-COFFEE-001",
		name: "Biji Kopi House Blend",
		category: "Minuman",
		unit: "kg",
		currentStock: 12,
		minStock: 5,
		cost: 185000,
	},
	{
		sku: "INV-POTATO-001",
		name: "Kentang Frozen",
		category: "Snack",
		unit: "kg",
		currentStock: 20,
		minStock: 8,
		cost: 28000,
	},
	{
		sku: "INV-OIL-001",
		name: "Minyak Goreng",
		category: "Bahan Pokok",
		unit: "liter",
		currentStock: 30,
		minStock: 12,
		cost: 17000,
	},
];

async function seedCategories() {
	for (const category of CATEGORY_SEEDS) {
		await prisma.cafeCategory.upsert({
			where: { name: category.name },
			update: { sortOrder: category.sortOrder, active: true },
			create: {
				name: category.name,
				sortOrder: category.sortOrder,
				active: true,
			},
		});
	}
}

async function seedMenuItems() {
	const categoryMap = new Map<string, number>();
	const categories = await prisma.cafeCategory.findMany({
		where: { name: { in: CATEGORY_SEEDS.map((item) => item.name) } },
		select: { id: true, name: true },
	});

	for (const category of categories) {
		categoryMap.set(category.name, category.id);
	}

	const now = new Date();

	for (const menu of MENU_SEEDS) {
		const categoryId = categoryMap.get(menu.categoryName);
		if (!categoryId) {
			throw new Error(`Kategori tidak ditemukan: ${menu.categoryName}`);
		}

		const existing = await prisma.cafeMenuItem.findFirst({
			where: {
				categoryId,
				name: menu.name,
			},
			select: { id: true },
		});

		if (existing) {
			await prisma.cafeMenuItem.update({
				where: { id: existing.id },
				data: {
					description: menu.description,
					price: menu.price,
					cost: menu.cost,
					active: true,
					updatedAt: now,
				},
			});
			continue;
		}

		await prisma.cafeMenuItem.create({
			data: {
				categoryId,
				name: menu.name,
				description: menu.description,
				price: menu.price,
				cost: menu.cost,
				active: true,
				updatedAt: now,
			},
		});
	}
}

async function seedInventory() {
	const now = new Date();

	for (const item of INVENTORY_SEEDS) {
		await prisma.inventoryItem.upsert({
			where: { sku: item.sku },
			update: {
				name: item.name,
				category: item.category,
				unit: item.unit,
				currentStock: item.currentStock,
				minStock: item.minStock,
				cost: item.cost,
				active: true,
				updatedAt: now,
			},
			create: {
				sku: item.sku,
				name: item.name,
				category: item.category,
				unit: item.unit,
				currentStock: item.currentStock,
				minStock: item.minStock,
				cost: item.cost,
				active: true,
				updatedAt: now,
			},
		});
	}
}

async function main() {
	await seedCategories();
	await seedMenuItems();
	await seedInventory();

	const [categoryCount, menuCount, inventoryCount] = await Promise.all([
		prisma.cafeCategory.count(),
		prisma.cafeMenuItem.count(),
		prisma.inventoryItem.count(),
	]);

	console.log("[seed] Master data cafe berhasil di-upsert");
	console.log(`[seed] cafe_categories: ${categoryCount}`);
	console.log(`[seed] cafe_menu_items: ${menuCount}`);
	console.log(`[seed] inventory_items: ${inventoryCount}`);
}

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
