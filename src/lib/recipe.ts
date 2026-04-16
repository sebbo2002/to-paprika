import archiver from 'archiver';
import { PassThrough } from 'node:stream';
import * as z from 'zod';

export const Recipe = z.object({
    cook_time: z
        .string()
        .optional()
        .nullable()
        .describe(
            "Cooking time required, e.g. '30 min' or '1 h'. Keep it short.",
        ),
    description: z
        .string()
        .optional()
        .nullable()
        .describe(
            'A brief description of the recipe. Use newline characters for formatting.',
        ),
    directions: z
        .string()
        .describe(
            'Step-by-step instructions for preparing the recipe. Use newline characters to separate steps, but do not remove any existing bullets or numbers from a list.',
        ),
    ingredients: z.string(
        'Ingredients must be a string with each ingredient on a new line. Add required quantity at the front, e.g "1 cup milk" or "3 apples". Use markdown formatting to improve readability, for example to separate ingredients for dough and topping.',
    ),
    name: z.string(),
    notes: z
        .string()
        .describe(
            'An unconstrained field for providing miscellaneous notes. Use newline characters for formatting. Do not add stuff that belongs in other fields.',
        ),
    prep_time: z
        .string()
        .optional()
        .nullable()
        .describe(
            'Preparation time required before cooking, e.g. "15 min" or "30 min". Keep it short.',
        ),
    servings: z
        .string()
        .optional()
        .nullable()
        .describe('Number of servings, e.g. "2" or "4-6 servings".'),
    source: z
        .string()
        .optional()
        .nullable()
        .describe("Recipe source, e.g. 'Grandma's Cookbook, p. 123' or a URL."),
    total_time: z
        .string()
        .optional()
        .nullable()
        .describe(
            'Total time required to prepare the dish, e.g. "45 min" or "1.5 h". Keep it short.',
        ),
});

export type RecipeType = z.infer<typeof Recipe>;

/**
 * Convert an array of recipes to a .paprikarecipes buffer
 */
export async function toRecipes(recipes: RecipeType[]): Promise<Buffer> {
    const zip = archiver('zip', { zlib: { level: 9 } });
    const zipStream = new PassThrough();
    const chunks: Buffer[] = [];

    zipStream.on('data', (chunk) => chunks.push(chunk));
    zipStream.on('end', () => {});
    zip.pipe(zipStream);

    for (const recipe of recipes) {
        const data = Buffer.from(
            JSON.stringify({
                ...recipe,
                servings: toServings(recipe.servings),
            }),
        );
        zip.append(data, { name: `${recipe.name}.paprikarecipe` });
    }

    return new Promise((resolve, reject) => {
        zip.on('error', reject);
        zip.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
        zip.finalize();
    });
}
function toServings(servings: null | string | undefined): null | string {
    if (!servings) {
        return null;
    }
    if (/^[0-9]+ ?[mlg]{1,2}$/i.test(servings.trim())) {
        return servings;
    }

    const number = parseInt(servings, 10);
    if (!isNaN(number)) {
        return number.toString();
    }

    return servings;
}
