import {useState, Fragment} from 'react';
import * as React from 'react';
import YAML from 'yaml'
import { Form, Field } from 'react-final-form'
import { 
	keys,
	parseFloat,
	parseInt,
	pipe, 
	words, 
	joinWith, 
	map,
	range,
	add,
	fromMaybe,
	insert,
} from 'sanctuary'
import {
	createElement,
	createOption ,
	createNoChild,
} from './util'

const kebab = pipe([ words, joinWith ('-') ])
const orZero = f => pipe([f, fromMaybe (0)])
const intOrZero = orZero (parseInt (10))
const floatOrZero = orZero (parseFloat)
const succ = add (1)

// multimedia
// coffee variety /TODO
// grind size
const timeInput = {component: 'input', step: 1, min: 0, type: 'number'}
const gramsInput = {component: 'input', type: 'number', step: 0.1, min: 0}
const eventTypes = ['note', 'bloom', 'distribute', 'invert', 'swirl', 'break crust', 'draw down', 'pour', 'stop brew', 'cap on', 'grind', 'press', 'stir'].sort()
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
		label: 'start time',
		name: 'start',
		required,
		...timeInput,
	},
	{
		label: 'end time',
		name: 'end',
		...timeInput,
	},
	{
		label: 'range end time', //TODO better semiotics
		name: 'endRange',
		...timeInput,
	},
	{
		name: 'type',
		component: 'select',
		label: 'type',
		required,
		children: map (createOptionWithValueName) (eventTypes),
	},
	{
		name: 'quantity',
		label: 'end quantity',
		...gramsInput,
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
);


const objectEncoders = {
	json: s => JSON.stringify(s),
	yaml: s => YAML.stringify(s),
};
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

export const InputForm = props => {
	const { handleSetRecipe } = props;
	const handleSetRecipeFormat = 'no file';
	const outputters = insert (handleSetRecipeFormat) (handleSetRecipe) (objectEncoders)
	const [handleAddingEvent, eventRange] = useList ()
	const [handleAddEquip, equipRange] = useList ()

	const onSubmit = ({author, events = [], ...values}) => {
		const eventize = map (({start, end, type, quantity, ...rest}) => ({
			start: intOrZero (start),
			end: intOrZero (end === undefined ? start : end),
			quantity: floatOrZero (quantity ?? '0'),
			type: type ?? eventTypes[0],
			...rest,
		}))
		const {description, name, brewer, coffee, grind, water, format = 'json'} = values
		const recipe = { author, events: eventize (events), description, name, brewer, coffee, grind, water }
		const f = format === handleSetRecipeFormat ? handleSetRecipe : doFileStuff (format)
		f (recipe)
	};

	const columnalStyle = {display: 'grid', gridTemplateColumns: '50% 50%', width: 350};
	return (
		<div>
			<h1>create new recipe</h1>
			<Form
				onSubmit={onSubmit}
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
								n => `Event ${n}`,
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
