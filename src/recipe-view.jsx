import { Fragment } from 'react'
import { createNoChild, createElement } from './util'
import { 
	pipe, 
	prop,
	K,
	filter,
	get,
	isJust,
	reduce,
	last,
	map,
	append,
	fromMaybe,
	toUpper,
	words,
	unwords,
} from 'sanctuary'
import {
	Timeline,
	Events,
	TextEvent,
} from '@merc/react-timeline'
import {
	useSeconds
} from './coffeeHooks'

const capitalize = s => toUpper (s[0]) + s.slice(1)
const titleCase = pipe([words, map (capitalize), unwords])

// 0 => timelineRightBound , 
// you can take that and divide that to find the width of every 5 seconds

// Event[] -> number
const getTimelineRightBound = pipe([
	last,
	map (({endRange, end, start}) => endRange ?? end ?? start),
	map (n => ((n + 60) - (n % 60))),
	fromMaybe (0),
])

const bold = s => `**${s}**`
const italic = s => `_${s}_`
const id = x => x

const makeMarkdownText = ({type, quantity, description, runnerUp, inRange}) =>
	[
		pipe([
			inRange ? bold : runnerUp ? italic : id,
			titleCase,
		]) (type),
		quantity ? ` ${quantity}` : '',
		description ? `\n\n${description}` : '',
	].join('')
		
const showEventTiming = ({start, end, endRange, inRange, runnerUp}) =>
	// createElement (inRange ? 'b' : runnerUp ? 'em' : 'span') () (
		[start, end, endRange].filter(x => x !== undefined).join(' => ')
	// )

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
			key: `${o.start}${o.type}`, 
			date: showEventTiming (o), 
			text: makeMarkdownText ({quantity: quantities[quantity], ...o}) 
		})),
		map (createNoChild (TextEvent)),
		createElement (Events) (),
		createElement (Timeline) ()
	]) (events)
}

const MetadatumView = ({k, v}) => <div>{k}: <b>{v}</b></div>
const MetadataView = ({author, description, name, brewer, coffee, grind, water}) => (
	<Fragment>
		{map (createNoChild (MetadatumView)) ([
			{ key: 'Recipe', k: 'Recipe', v: name },
			{ key: 'Brewer', k: 'Brewer', v: brewer },
			{ key: 'Coffee', k: 'Coffee', v: `${coffee}g` },
			{ key: 'Grind',  k: 'Grind',  v: grind },
			{ key: 'Water',  k: 'Water',  v: <b>{water.grams} @ {water.temp}C</b> },
		])}
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

export const RecipeView = props => {
	const {recipe} = props
	const {start, pause, isRunning, seconds} = useSeconds();
	const {vals: events} = findSelected (seconds) (recipe.events)
	return (
		<div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
			<div>
				{createNoChild (MetadataView) (recipe)}
			</div>
			<div style={{marginTop: 10}} />
			<div>
				{seconds}s
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
