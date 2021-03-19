import {useState, Fragment, createElement as ReactDotCreateElement} from 'react';
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
} from 'sanctuary'



//TODO event input and JSON export

const kbab = s => joinWith ('-') (words (s))
const kebab = pipe([ words, joinWith ('-') ])

// type Component = React.ComponentType<FieldRenderProps<any, HTMLElement>>;
// type Fuck = {label: string; component?: Component};
const eventTypes = ['note', 'bloom', 'distribute', 'invert', 'swirl', 'break crust', 'draw down', 'pour', 'stop brew', 'cap on', 'grind', 'press', 'stir']
// type Event = {
// 	start: number;
// 	end: number;
// 	rangeEnd?: number;
// 	type: EventType;
// 	quantity?: number;
// 	description?: string;
// };
	// multimedia
	// equipment needed
	// filter type
	// coffee variety
	// ideal water temperature
	// amount of water
	// grams of coffee
	// grind size
	// overall duration of recipe
	// list of steps
const rawMetadata = [
	{name: 'author.name', label: 'your name'},
	{name: 'author.email', label: 'your email'},
	{name: 'author.url', label: 'a link to represent you'},
	{name: 'description', label: 'Describe your recipe', component: 'textarea'},
];
const aramseData = [
	{name: 'name', label: 'your recipe\'s name'},
	{label: 'brewer'},
	{name: 'coffee', label: 'coffee (grams)'},
	{label: 'grind'},
	{label: 'water'},
];
// const socialFields = [
	// ['your recipe\'s category'],
// ];
const textFields = [...rawMetadata, ...aramseData]

//TODO assume short
// type EventInputProps = {idx: number; id: string; headerElement?: string};
const createElement = comp => props => children => ReactDotCreateElement(comp, props, children)
const createOption = createElement ('option')
const createOptionWithValueName = t => createOption ({key: t, value: t}) (t)
const EventInput = ({idx, id, headerElement = 'h3', children, ...rest}) => (
	<div>
		{children}
		<div {...rest}>
			<>
				<label htmlFor={`${id}start`}>start time</label>
				<Field component='input' type="number" name={`${id}start`} id={`${id}start`} step={5} min={0} max={60 * 10} />
			</>
			<>
				<label htmlFor={`${id}end`}>end time</label>
				<Field component='input' type="number" name={`${id}end`} id={`${id}end`} step={5} min={0} max={60 * 10} />
			</>
			<>
				<label htmlFor={`${id}type`}>type</label>
				<Field name={`${id}type`} id={`${id}type`} component='select'>
					{map (createOptionWithValueName) (eventTypes)}
				</Field>
			</>
			<>
				<label htmlFor={`${id}quantity`}>end quantity</label>
				<Field component='input' type="number" name={`${id}quantity`} id={`${id}quantity`} step={0.5} />
			</>
			<>
				<label htmlFor={`${id}description`}>description</label>
				<Field component='textarea' name={`${id}description`} id={`${id}description`} />
			</>
		</div>
	</div>
);

const succ = add (1)
const objectEncoders = {
	json: s => JSON.stringify(s),
	yaml: s => YAML.stringify(s),
};
const fileType = {
	json: 'application/json',
	yaml: 'text/x-yaml',
}

const orZero = f => pipe([f, fromMaybe (0)])
const intOrZero = orZero (parseInt (10))
const floatOrZero = orZero (parseFloat)

export const InputForm = () => {
	const [numberOfEvents, setNEvents] = useState (1)
	const handleAddingEvent = () => setNEvents(succ)
	const eventRange = range (1) (succ (numberOfEvents))

	const onSubmit = ({author, events = [], ...values}) => {
		const eventize = map (({start, end, type, quantity, ...rest}) => ({
			start: intOrZero (start),
			end: intOrZero (end === undefined ? start : end),
			quantity: floatOrZero (quantity),
			type: type ?? eventTypes[0],
			...rest,
		}))
		const {description, name, brewer, coffee, grind, water, format = 'json'} = values
		const recipe = { author, events: eventize (events), description, name, brewer, coffee, grind, water }
		console.log('recipe', recipe);
		const fileData = objectEncoders[format] (recipe)
		const type = fileType[format]
		const fileName = `${name}.${format}`
		const file = new File([fileData], fileName, {type});
		const fileUrl = URL.createObjectURL(file)
		const link = document.createElement('a')
		link.download = fileName
		link.href = fileUrl
		link.click ()
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
							{map (({label, component = 'input', name: propsName}) => {
								const name = propsName ?? kebab (label)
								const id = name
								return <Fragment key={id}>
									<label htmlFor={id}>{label}</label>
									<Field id={id} name={name} component={component}/>
								</Fragment>
							}) (textFields)}
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
							<Fragment>
								<label htmlFor='format'>export format</label>
								<Field name='format' id='format' component='select'>
									{map (createOptionWithValueName) (keys (objectEncoders))}
								</Field>
							</Fragment>
						</div>
						<button type='submit'>submit</button>
					</form>
				}
			/>
		</div>
	);
};
