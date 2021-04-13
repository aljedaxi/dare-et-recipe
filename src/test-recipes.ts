type LengthyEventType = 'bloom' | 'draw down' | 'pour' | 'press' 
type TimelessEventType = 'note' | 'distribute' | 'invert' | 'swirl' | 'break crust' | 'stop brew' | 'cap on' | 'grind' | 'start timer' | 'stir'

type EventType = LengthyEventType | TimelessEventType

type Author = {
	name: string;
	url?: string;
	email?: string;
}

type EventCommon = {
	description?: string;
	quantityDelta?: number;
}

type LengthyEvent = { duration: number; type: LengthyEventType; } & EventCommon;

type TimelessEvent = { type: TimelessEventType; } & EventCommon;

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
	events: Array<LengthyEvent | TimelessEvent>
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
		{ type: 'note', description: 'this recipe has steps without clear times. everything just sort of takes as long as it takes.' },
		{ type: 'note', description: 'start with the smaller vessel.' },
		{ duration: 0, type: 'bloom', quantityDelta: 60, },
		{ type: 'stir', description: 'gently agitate with back of spoon; bring coffee from edge into middle.'},
		{ duration: 0, type: 'draw down'},
		{ type: 'note', description: 'swap out the vesels.', quantityDelta: -60 },
		{ duration: 0, type: 'pour', quantityDelta: 100 },
		{ type: 'break crust', description: 'scoop off foam' },
		{ duration: 0, type: 'pour', quantityDelta: 70 },
		{ duration: 0, type: 'pour', quantityDelta: 50, description: 'add bypass to the larger vessel, to taste.' },
		{ type: 'note', quantityDelta: 5.5, description: 'add liquid from the smaller vessel into the larger vessel, to taste.' },
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
		{ duration: 4 * 60, type: 'pour', quantityDelta: 500, },
		{ type: 'break crust', description: 'scoop that foam out'},
		{ duration: 5 * 60, type: 'press', description: 'press only to the surface of the liquid'},
		{ type: 'note', description: 'the longer you wait, the bigger the taste, but you can pour whenever you\'re ready.' }
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
		{ duration: 0, type: 'pour', quantityDelta: 60 },
		{ type: 'swirl', },
		{ duration: 45, type: 'bloom' },
		{ duration: 30, type: 'pour', quantityDelta: 240 },
		{ duration: 30, type: 'pour', quantityDelta: 200 },
		{ type: 'stir', description: 'Gently stir the water surface along the inner wall of the v60, to knock down grounds. Do not touch the coffee bed.' },
		{ type: 'swirl' },
		{ duration: (2 * 60) - 15, type: 'draw down' },
	]
}

export const testRecipes = [ultimateV60, ultimateFrenchPress, eldric];
