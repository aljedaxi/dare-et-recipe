import { Fragment, useState } from 'react'
import { createNoChild, createElement } from '../util'
import { 
	zipWith,
	pipe, 
	stripPrefix,
	splitOn,
	find,
	chain,
	prop,
	K,
	isJust,
	reduce,
	map,
	append,
	toUpper,
	words,
	unwords,
	parseJson,
	values,
} from 'sanctuary'
import {
	Timeline,
	Events,
	TextEvent,
} from '@merc/react-timeline'
import {
	useSeconds
} from '../coffeeHooks'
import {
	useHistory,
} from 'react-router-dom'
import {
	DialogOverlay, DialogContent
} from '@reach/dialog'
import '@reach/dialog/styles.css'
import {
	Steps as OldRecipeView
} from '../components/old-recipe-view'
const trace = s => {console.log(s); return s;};

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

// 0 => timelineRightBound , 
// you can take that and divide that to find the width of every 5 seconds

// Event[] -> number
// const getTimelineRightBound = pipe([
// 	last,
// 	map (({end, start}) => end ?? start),
// 	map (n => ((n + 60) - (n % 60))),
// 	fromMaybe (0),
// ])

const makeMarkdownText = ({type, quantity, description, runnerUp, inRange}) =>
	[
		pipe([ inRange ? bold : runnerUp ? italic : id, titleCase, ]) (type),
		quantity ? ` ${quantity}g` : '',
		description ? `\n\n${description}` : '',
	].join('')
		
const showEventTiming = ({start, end}) => 
	start === end ? '' : [start, end].map(formatTime).join(' => ')

const EventsView = props => {
	const {events} = props;
	return pipe([
		map ((o) => ({ 
			key: o.description ? o.description : `${o.start}${o.type}`, 
			date: showEventTiming (o), 
			text: makeMarkdownText (o),
		})),
		map (createNoChild (TextEvent)),
		createElement (Events) (),
		createElement (Timeline) ()
	]) (events)
}

const MetadatumView = ({k, v}) => <div>{k}: <b>{v}</b></div>
const MetadataView = ({author, description, name, brewer, coffee, grind, water, handleChangeCoffee, handleChangeWater, waterTemp,}) => (
	<Fragment>
		<div>
			Recipe: <b> <cite> {name} </cite> </b>
		</div>
		{map (createNoChild (MetadatumView)) ([
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

export const YeOldeTimelineView = ({recipe, handlers, seconds, isRunning, pause, start, events, children}) => {
	return (
		<div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
			<div>
				{createNoChild (MetadataView) ({...recipe, ...handlers, waterTemp: recipe.water.temp })}
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
}

const unsafeLast = xs => xs[xs.length - 1]
const startlify = events => pipe([
	reduce (xs => ({duration = 0}) => {
		const {end} = unsafeLast (xs) ?? {end: 0}
		return append ({start: end, end: end + duration}) (xs)
	}) ([]),
	zipWith (x => y => ({...x, ...y})) (events),
]) (events)
const getQd = x => x?.quantityDelta ?? 0
const getQ = x => x?.quantity ?? 0
const quantify = events => pipe([
	reduce (xs => x => {
		const lastQd = getQ (unsafeLast (xs))
		return append ({quantity: lastQd + getQd (x)}) (xs)
	}) ([]),
	zipWith (x => y => ({...x, ...y})) (events),
]) (events)

const doSelectyStuff = ({seconds, multiplyWater}) => pipe([
	startlify,
	quantify,
	findSelected (seconds),
	prop ('vals'),
	map (transform({quantity: multiplyWater})),
])

const useShowHide = (def = false) => {
	const [isShowing, setShowing] = useState (def)
	const show = () => setShowing (true)
	const hide = () => setShowing (false)
	return [show, hide, isShowing]
}

const viewers = {
	// YeOldeTimelineView: { component: YeOldeTimelineView, label: 'vertical timeline viewer', },
	OldRecipeView: { component: OldRecipeView, label: 'step by step view' }
}

const viewerNames = map (prop ('label')) (values (viewers))
const viewerOptions = map (
	s => createElement ('option') ({key: s}) (s)
) (viewerNames)

// const viewersByLabel = Object.fromEntries(
// 	map (({label, component}) => [label, component]) (values (viewers))
// )

export const RecipeView = props => {
	const recipe = useRecipe (props)
	const [showChangeViewerDialog, hideChangeViewerDialog, isChangeViewerShowing] = useShowHide ()
	const [showHelpDialog, hideHelpDialog, isHelpDialogShowing] = useShowHide ()
	const [selecty, setSelecty] = useState (viewerNames[0])
	const {multiplyWater, ...handlers} = useMultiplier(recipe);
	const {start, pause, isRunning, seconds} = useSeconds();
	const events = doSelectyStuff ({seconds, multiplyWater}) (recipe.events)
	const EventViewer = YeOldeTimelineView;
	const z = {zIndex: 9000}
	return (
		<Fragment>
			<button onClick={showChangeViewerDialog}>change viewer</button>
			<button onClick={showHelpDialog}>HELP</button>
			<DialogOverlay style={z} aria-label="select a viewer" isOpen={isChangeViewerShowing} onDismiss={hideChangeViewerDialog}>
				<DialogContent>
					<div>
						<label htmlFor="options">viewer options:</label>
						<select id="options" value={selecty} onChange={e => setSelecty (e.target.value)} >
							{viewerOptions}
						</select>
					</div>
					<button className="close-button" onClick={hideChangeViewerDialog}>
						done
					</button>
				</DialogContent>
			</DialogOverlay>
			<DialogOverlay style={z} aria-label='help' isOpen={isHelpDialogShowing} onDismiss={hideHelpDialog} >
				<DialogContent>
					<div>
						<h2>Help</h2>
						<h3>Metadata</h3>
						<p>
							the top is recipe metadata.  if you change the amount of water, the amount of coffee will change to stay in sync with it, but be warned: 
							<ul>
								<li>this assumes that all the scale readings in the recipe are a pure function of water</li>
								<li>
									the recipe may not be designed for specific water-coffee values
								</li>
							</ul>
						</p>
						<h3>Recipe Timeline</h3>
						<ul>
							<li>the pink bit is the start time =&gt; the end time</li>
							<li>if the timer is between an event&apos;s start and end time, the type will be <b>bolded</b></li>
							<li>the next event is <i>italicised</i></li>
							<li>the gram reading next to the type says what the scale should read at the end of the action</li>
						</ul>
					</div>
					<button className="close-button" onClick={hideHelpDialog}>
						done
					</button>
				</DialogContent>
			</DialogOverlay>
			{createNoChild (EventViewer) ({recipe, handlers, seconds, isRunning, pause, start, events})}
		</Fragment>
	)
};
