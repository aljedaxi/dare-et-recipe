import {useState, Fragment} from 'react';
import * as React from 'react';
import YAML from 'yaml'
import { Form, Field } from 'react-final-form'
import { 
	keys,
	chain,
	mapLeft,
	justs,
	fromPairs,
	parseFloat,
	pipe, 
	words, 
	joinWith, 
	map,
	range,
	add,
	ifElse,
	insert,
	elem,
	Just,
	Nothing,
	Pair,
	fromMaybe,
} from 'sanctuary'
import {
	createElement,
	createOption ,
	createNoChild,
} from '../util'

const isString = s => typeof s === 'string'
const parseIfString = pipe([
	ifElse (isString) (parseFloat) (Just),
	fromMaybe (0),
])
const kebab = pipe([ words, joinWith ('-') ])
const succ = add (1)
const mergeAll = pipe([
	chain (Object.entries),
	Object.fromEntries
])

// multimedia
// coffee variety /TODO
// grind size
const lengthyEvents = [
	'bloom', 
	'draw down', 
	'pour',
	'press', 
	'stir', 
]
const timelessEvents = [
	'note', 
	'distribute', 
	'invert',
	'swirl', 
	'break crust',
	'stop brew',
	'cap on',
	'grind',
	'start timer',
]
const eventTypes = [ ...lengthyEvents, ...timelessEvents ].sort()
const TIMELESS_ERROR = 'for the sake of these recipes, this event doesn\'t take time. please reset the time to 0.'
const TIMEFUL_ERROR = 'for the sake of these recipes, this kind of event takes time. please specify how long this\'ll take (and maybe add a "start timer" event before it).'
const keyMap = f => o => o.map((e, k) => f (e) (k))
const validateEvents = pipe([
	keyMap (({type = eventTypes[0], duration = 0}) => (k) => 
			elem (type) (timelessEvents) && duration > 0 ? Just (Pair (`[${k}]type`) (TIMELESS_ERROR))
		: elem (type) (lengthyEvents) && duration < 1  ? Just (Pair (`[${k}]type`) (TIMEFUL_ERROR))
		: Nothing
	),
	justs,
	map (mapLeft (s => `events${s}`)),
	fromPairs,
])

const validateAuthor = pipe([
	({email = ''}) => [
		email.length && !email.includes('@') 
			? Just (Pair ('email') ('please enter a valid email'))
			: Nothing,
	],
	justs,
	fromPairs,
])

const timeInput = {component: 'input', step: 1, min: 0, type: 'number'}
const gramsInput = {component: 'input', type: 'number', step: 0.1, min: 0}
const required = true
const rawMetadata = [
	{name: 'author.name', label: 'your name', autoComplete: 'name'},
	{name: 'author.email', label: 'your email', type: 'email', autoComplete: 'email'},
	{name: 'author.url', label: 'a link to represent you', autoComplete: 'url'},
	{name: 'description', label: 'Describe your recipe', component: 'textarea'},
];
const aramseData = [
	{name: 'name', label: 'your recipe\'s name', required, autoComplete: 'off'},
	{label: 'brewer', required},
	{name: 'coffee', label: 'coffee (grams)', required, ...gramsInput},
	{label: 'grind', required},
	{name: 'water.grams', label: 'water (g/ml)', required, ...gramsInput},
	{name: 'water.temp', label: 'water temp (celcius)', type: 'number', required, step: 1},
];
// const socialFields = [
	// ['your recipe\'s category'],
// ];
const textFields = [...rawMetadata, ...aramseData]


//TODO assume short
// type EventInputProps = {idx: number; id: string; headerElement?: string};
const createOptionWithValueName = t => createOption ({key: t, value: t}) (t)
const LabelAndField = ({id, label, ...rest}) =>
	<>
		<label htmlFor={id}>{label}</label>
		<Field {...rest} />
	</>

const eventData = [
	{
		label: 'how long is the event?',
		name: 'duration',
		required, 
		defaultValue: 0, 
		...timeInput,
		children: ({input, meta}) => (
			<Fragment>
				{createNoChild ('input') (input)}
				{meta.error && meta.touched ? meta.error : null}
			</Fragment>
		)
	},
	// {
	// 	label: 'range end time', //TODO better semiotics
	// 	name: 'endRange',
	// 	...timeInput,
	// },
	{
		name: 'type',
		component: 'select',
		label: 'type',
		required,
		children: map (createOptionWithValueName) (eventTypes),
	},
	{
		name: 'quantityDelta',
		label: 'change in scale reading',
		defaultValue: 0,
		...gramsInput,
		min: undefined,
	}, 
	{
		name: 'description',
		label: 'description',
		component: 'textarea', 
	}
];

const EventInput = ({idx, id, headerElement = 'h3', children, ...rest}) => (
	<div>
		{children}
		<div {...rest}>
			{map (pipe([
				({name, ...rest}) => ({name: id + name, id: id + name, key: id + name, ...rest}),
				createNoChild (LabelAndField)
			])) (eventData)}
		</div>
	</div>
)

const objectEncoders = {
	json: s => JSON.stringify(s),
	yaml: s => YAML.stringify(s),
}

const fileType = {
	json: 'application/json',
	yaml: 'text/x-yaml',
}

const doFileStuff = format => recipe => {
	const {name} = recipe
	const fileData = objectEncoders[format] (recipe)
	const type = fileType[format]
	const fileName = `${name}.${format}`
	const file = new File([fileData], fileName, {type})
	const fileUrl = URL.createObjectURL(file)
	const link = document.createElement('a')
	link.download = fileName
	link.href = fileUrl
	link.click ()
}

const useList = (startingN = 1) => {
	const [n, setN] = useState (startingN)
	return [_ => setN (succ), range (1) (succ (n))]
}

const removeUndefineds = o => 
	Object.fromEntries ( Object.entries (o).filter(([_, v]) => v !== undefined))

const onSubmit = ({handleSetRecipeFormat, handleSetRecipe}) => ({author, events = [], ...values}) => {
	const eventize = map (({quantityDelta, duration, ...rest}) => ({
		quantityDelta: parseIfString (quantityDelta),
		duration: parseIfString (duration),
		...rest,
	}))
	const {description, name, brewer, coffee, grind, water, format = 'json'} = values
	const recipe = { 
		author,
		events: eventize (events),
		description,
		name,
		brewer,
		coffee: parseIfString (coffee),
		grind,
		water: map (parseIfString) (water), 
	}
	const f = format === handleSetRecipeFormat ? handleSetRecipe : doFileStuff (format)
	f (removeUndefineds (recipe))
};

export const InputForm = props => {
	const { handleSetRecipe } = props;
	const handleSetRecipeFormat = 'don\'t create a file, just show me the recipe';
	const outputters = insert (handleSetRecipeFormat) (handleSetRecipe) (objectEncoders)
	const [handleAddingEvent, eventRange] = useList ()
	const [handleAddEquip, equipRange] = useList ()

	const handleSubmit = onSubmit ({handleSetRecipeFormat, handleSetRecipe})

	const columnalStyle = {display: 'grid', gridTemplateColumns: '50% 50%', width: 350};
	return (
		<div>
			<h1>create new recipe</h1>
			<Form
				onSubmit={handleSubmit}
				validate={({events = [], author = {}}) => 
					mergeAll([ validateEvents (events), validateAuthor (author) ])
				}
				render={({handleSubmit}) =>
					<form onSubmit={handleSubmit}>
						<h2>metadata</h2>
						<div style={columnalStyle}>
							{map (({label, component = 'input', name: propsName, ...rest}) => {
								const name = propsName ?? kebab (label)
								const id = name
								const textProps = {key: id, id, label, name, component, ...rest}
								return createNoChild (LabelAndField) (textProps)
							}) (textFields)}
							{map (n =>
								createNoChild (LabelAndField) ({
									key: n, name: `equipment[${n}]`, label: 'extra equipment', component: 'input'
								})
							) (equipRange)}
							<button type='button' onClick={handleAddEquip}>add another piece of equipment</button>
						</div>
						<h2>events</h2>
						{map (n =>
							pipe([
								n => `event ${n}`,
								createElement ('h3') (),
								createElement (EventInput) ({idx: n, key: n, id: `events[${n - 1}]`, style: columnalStyle})
							]) (n)
						) (eventRange)}
						<button type='button' onClick={handleAddingEvent}>add event</button>
						<h2>export options</h2>
						<div style={columnalStyle}>
							{createElement (LabelAndField) ({
								name: 'format',
								id: 'format',
								component: 'select',
								label: 'export format',
								children: map (createOptionWithValueName) (eventTypes),
							}) (map (createOptionWithValueName) (keys (outputters)))}
						</div>
						<button type='submit'>submit</button>
					</form>
				}
			/>
		</div>
	);
};
