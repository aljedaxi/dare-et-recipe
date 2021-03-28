type EventType = 'note' | 'bloom' | 'distribute' | 'invert' | 'swirl' | 'break crust' | 'draw down' | 'pour' | 'stop brew' | 'cap on' | 'grind' | 'press' | 'stir'

type Author = {
	name: string;
	url?: string;
	email?: string;
}

type Event = {
	start: number;
	type: EventType;
	end?: number;
	endRange?: number;
	description?: string;
	quantity?: number;
}

type Recipe = {
	author: Author;
	description: string;
	name: string;
	brewer: string;
	equipment?: string[];
	coffee: number;
	grind: string;
	water: {
		grams: number;
		temp: number;
	};
	events: Event[];
}

const eldric: Recipe = {
	author: {
		name: 'Eldric Stuart',
		url: 'https://www.instagram.com/es.says/'
	},
	description: 'the default harken v60 technique',
	name: 'harken v60',
	brewer: 'v60',
	equipment: [
		'two vesels: one for 60ml water, another for xml water',
	],
	coffee: 23,
	grind: 'Medium',
	water: {
		temp: 94,
		grams: 60 + 100 + 70 + 50,
	},
	events: [
		{ start: 0, type: 'note', description: 'this recipe has steps without clear times. everything just sort of takes as long as it takes.' },
		{ start: 0, type: 'note', description: 'start with the smaller vessel.' },
		{ start: 0, type: 'bloom', quantity: 60, },
		{ start: 1, type: 'stir', description: 'gently agitate with back of spoon; bring coffee from edge into middle.'},
		{ start: 2, type: 'draw down'},
		{ start: 3, type: 'note', description: 'swap out the vesels.' },
		{ start: 4, type: 'pour', quantity: 100 },
		{ start: 5, type: 'break crust', description: 'scoop off foam' },
		{ start: 6, type: 'pour', quantity: 70 },
		{ start: 7, type: 'pour', quantity: 50, description: 'add bypass to the larger vessel, to taste.' },
		{ start: 8, type: 'note', quantity: 5.5, description: 'add liquid from the smaller vessel into the larger vessel, to taste.' },
	]
}

const ultimateFrenchPress: Recipe = {
	author: {
		name: 'james hoffmann',
		email: 'please-dont@harass.james',
		url: 'jameshoffmann.co.uk',
	},
	description: 'the ultimate french press technique',
	name: 'ultimate french press technique',
	brewer: 'french press',
	coffee: 30,
	grind: 'Medium',
	water: {
		temp: 100,
		grams: 500,
	},
	events: [
		{ start: 0, type: 'pour', quantity: 500, },
		{ start: 4 * 60, type: 'break crust', description: 'scoop that foam out'},
		{ start: (4 + 5) * 60, type: 'press', description: 'press only to the surface of the liquid'},
		{ start: (4 + 5) * 60, type: 'note', description: 'the longer you wait, the bigger the taste, but you can pour whenever you\'re ready.' }
	]
}

const ultimateV60: Recipe = {
	author: {
		name: 'james hoffmann',
		email: 'please-dont@harass.james',
		url: 'jameshoffmann.co.uk',
	},
	description: 'the ultimate v60 technique',
	name: 'ultimate v60 technique',
	brewer: 'v60',
	coffee: 30,
	grind: 'Medium Fine',
	water: {
		temp: 95,
		grams: 500,
	},
	events: [
		{ start: 0, end: 10, type: 'bloom', quantity: 60, },
		{ start: 10, type: 'swirl', },
		{ start: 45, end: 75, type: 'pour', quantity: 240, },
		{ start: 75, end: 105, type: 'pour', quantity: 500 - 240 - 60, },
		{ start: 105, type: 'stir', description: 'Gently stir the water surface along the inner wall of the v60, to knock down grounds. Do not touch the coffee bed.' },
		{ start: 120, type: 'swirl', },
		{ start: 120, end: 120 + 45, endRange: (60 * 3) + 15, type: 'draw down', },
	]
}

export const testRecipes = [ultimateV60, ultimateFrenchPress, eldric];
