import { Fragment, useState, useEffect } from 'react'
import { createNoChild, createElement } from './util'
import { 
	pipe, 
	stripPrefix,
	splitOn,
	find,
	chain,
	prop,
	K,
	filter,
	get,
	isJust,
	joinWith,
	reduce,
	last,
	map,
	append,
	fromMaybe,
	toUpper,
	words,
	unwords,
	Nothing,
	Just,
	justs,
	parseJson,
} from 'sanctuary'
import {
	Timeline,
	Events,
	TextEvent,
} from '@merc/react-timeline'
import {
	useSeconds
} from './coffeeHooks'
import {
	useHistory,
} from 'react-router-dom'

const transform = oOfF => oOfD =>
	Object.fromEntries(
		Object.entries(oOfD).map(([k, v]) => [k, k in oOfF ? oOfF[k](v) : v])
	)
const capitalize = s => toUpper (s[0]) + s.slice(1)
const titleCase = pipe([words, map (capitalize), unwords])
const formatTime = n => 
	n < 60       ? `${n}s`
: n % 60 === 0 ? `${Math.floor(n/60)}m` 
:                `${Math.floor(n / 60)}m${n % 60}s` 
const bold = s => `**${s}**`
const italic = s => `_${s}_`
const id = x => x
const nothingIfUndefined = x => x === undefined ? Nothing : Just (x)

// 0 => timelineRightBound , 
// you can take that and divide that to find the width of every 5 seconds

// Event[] -> number
const getTimelineRightBound = pipe([
	last,
	map (({endRange, end, start}) => endRange ?? end ?? start),
	map (n => ((n + 60) - (n % 60))),
	fromMaybe (0),
])

const makeMarkdownText = ({type, quantity, description, runnerUp, inRange}) =>
	[
		pipe([ inRange ? bold : runnerUp ? italic : id, titleCase, ]) (type),
		quantity ? ` ${quantity}g` : '',
		description ? `\n\n${description}` : '',
	].join('')
		
const showEventTiming = ({start, end, endRange}) =>
	pipe([justs, map (formatTime), joinWith (' => ')]) (
		[start, end, endRange].map(nothingIfUndefined)
	)

const EventsView = props => {
	const {events} = props;
	const quantities = pipe([
		filter (pipe ([get (K (true)) ('quantity'), isJust])),
		reduce (({acc, vals}) => x => 
			({acc: acc + x.quantity, vals: append ([x.quantity, acc + x.quantity]) (vals)})
		) ({acc: 0, vals: []}),
		prop ('vals'),
		Object.fromEntries,
	]) (events)
	return pipe([
		map (({quantity, ...o}) => ({ 
			key: o.description ? o.description : `${o.start}${o.type}`, 
			date: showEventTiming (o), 
			text: makeMarkdownText ({quantity: quantities[quantity], ...o}),
		})),
		map (createNoChild (TextEvent)),
		createElement (Events) (),
		createElement (Timeline) ()
	]) (events)
}

const MetadatumView = ({k, v}) => <div>{k}: <b>{v}</b></div>
const MetadataView = ({author, description, name, brewer, coffee, grind, water, handleChangeCoffee, handleChangeWater, waterTemp,}) => (
	<Fragment>
		{map (createNoChild (MetadatumView)) ([
			{ key: 'Recipe', k: 'Recipe', v: name },
			{ key: 'Brewer', k: 'Brewer', v: brewer },
			{ key: 'Grind',  k: 'Grind',  v: grind },
		])}
		<div>
			<label htmlFor='water'>Water</label>
			<b>
				<input type="number" value={water} onChange={handleChangeWater}/>
				@ 
				{waterTemp}C
			</b>
		</div>
		<div>
			<label htmlFor='coffee'>Coffee</label>
			<b>
				<input type="number" value={coffee} onChange={handleChangeCoffee} />g
			</b>
		</div>
	</Fragment>
);

const trace = s => {console.log(s); return s;};
const isInRange = currentTime => ({start, end, endRange}) => 
	(currentTime >= start) && (currentTime <= end ?? start) && (trace(currentTime) <= trace(endRange ?? end ?? start))

// is within range, or is closer to beginning to any other
const findSelected = currentTime => reduce(({hasDoneThing, vals}) => val => {
	const inRange = isInRange (currentTime) (val)
	const runnerUp = val.start > currentTime && !hasDoneThing
	return {
		hasDoneThing: runnerUp || hasDoneThing, 
		vals: append ({inRange, runnerUp, ...val}) (vals)
	}
}) ({hasDoneThing: false, vals: []})

const useMultiplier = ({water: {grams: water}, coffee}) => {
	const [dirty, setDirty] = useState(false)
	const [gramsCoffee, setGramsCoffee] = useState(coffee)
	const [gramsWater, setGramsWater] = useState(water)
	const coffeeToWater = nCoffee => water / coffee * nCoffee
	const waterToCoffee = nWater => coffee / water * nWater
	const waterRatio = gramsWater / water
	return {
		handleChangeWater: e => {
			const {value} = e.target
			setGramsWater(value)
			setGramsCoffee(waterToCoffee (value))
			if (!dirty) {
				alert ('only change this if you know all the quantities in the recipe are water!')
				setDirty (true)
			}
		},
		handleChangeCoffee: e => {
			const {value} = e.target
			setGramsCoffee(value)
			setGramsWater(coffeeToWater (value))
			if (!dirty) {
				alert ('only change this if you know all the quantities in the recipe are water!')
				setDirty (true)
			}
		},
		multiplyWater: n => n * waterRatio,
		coffee: gramsCoffee,
		water: gramsWater,
	};
};

const getRecipeFromSearch = pipe([
	stripPrefix ('?'),
	map (splitOn ('&')),
	chain (find (s => s.includes ('recipe'))),
	chain (stripPrefix ('recipe=')),
	map (decodeURIComponent),
	chain (parseJson (K (true))),
])

const useRecipe = ({recipe: propsRecipe}) => {
	const history = useHistory()
	const maybeRecipe = getRecipeFromSearch (document.location.search)
	if (isJust (maybeRecipe)) {
		return maybeRecipe.value
	} else {
		history.push('/404')
	}
}

export const RecipeView = props => {
	const recipe = useRecipe (props)
	const {multiplyWater, ...handlers} = useMultiplier(recipe);
	const {start, pause, isRunning, seconds} = useSeconds();
	const events = pipe([
		findSelected (seconds),
		prop ('vals'),
		map (transform({quantity: multiplyWater})),
	]) (recipe.events)
	return (
		<div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
			<div>
				{createNoChild (MetadataView) ({...recipe, ...handlers, waterTemp: recipe.water.temp })}
			</div>
			<div style={{marginTop: 10}} />
			<div>
				{formatTime(seconds)}
			</div>
			<div>
				<button onClick={isRunning ? pause : start}>
					{isRunning ? 'pause' : 'start'}
				</button>
			</div>
			<div style={{marginTop: 10}} />
			<div>
				{createNoChild (EventsView) ({events})}
			</div>
		</div>
	)
};
