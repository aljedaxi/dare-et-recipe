import { createNoChild, createElement } from './util'
import { 
	pipe, 
	reduce,
	last,
	map,
	append,
	fromMaybe,
	toUpper,
	words,
	unwords,
	prop
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

const makeMarkdownText = ({type, quantity, description}) =>
	[
		`**${titleCase (type)}**`,
		quantity ? ` ${quantity}` : '',
		description ? `\n\n${description}` : '',
	].join('')
		
const showEventTiming = ({start, end, endRange, inRange, runnerUp}) =>
	createElement (inRange ? 'b' : runnerUp ? 'em' : 'span') () (
		[start, end, endRange].filter(x => x !== undefined).join(' => ')
	)

const EventsView = props => pipe([
	prop ('events'),
	map (o => ({ key: `${o.start}${o.type}`, date: showEventTiming (o), text: makeMarkdownText (o) })),
	map (createNoChild (TextEvent)),
	createElement (Events) (),
	createElement (Timeline) ({opts: {layout: 'inline-evts'}})
]) (props)

const MetadataView = ({author, description, name, brewer, coffee, grind, water}) => (
	<div>
		{author ? (
		<div>
			Recipe: <b>{author.name}</b>
		</div> ) : null}
		<div>
			Brewer: <b>{brewer}</b>
		</div>
		<div>
			Coffee: <b>{coffee}g</b>
		</div>
		<div>
			Grind: {grind}
		</div>
		<div>
			Water: <b>{water.grams} @ {water.temp}C</b>
		</div>
	</div>
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
	console.log('events', events);
	return (
		<div style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
			<div>
				{createNoChild (MetadataView) (recipe)}
			</div>
			<div style={{alignSelf: 'end'}}>
				<div>
					<div>
						{seconds}
					</div>
					<div>
						<button onClick={isRunning ? pause : start}>
							{isRunning ? 'pause' : 'start'}
						</button>
					</div>
				</div>
				<div>
					{createNoChild (EventsView) ({events})}
				</div>
			</div>
		</div>
	)
};
