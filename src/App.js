import {useState, Fragment } from 'react'
import {InputForm} from './inputForm'
import {RecipeView} from './recipe-view'
import { createNoChild } from './util'
import {
	prepend,
	keys,
	map,
} from 'sanctuary'
import YAML from 'yaml'
const eldric = {
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

const ultimateFrenchPress = {
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
		{ start: (4 + 5) * 60, type: 'note', description: 'the longer you wait, the bigger the taste, but you can pour one out whenever you\'re ready.' }
	]
}

const ultimateV60 = {
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
		{ start: 75, end: 105, type: 'pour', quantity: 500 - 240, },
		{ start: 105, type: 'stir', description: 'Gently stir the water surface along the inner wall of the v60, to knock down grounds. Do not touch the coffee bed.' },
		{ start: 120, type: 'swirl', },
		{ start: 120, end: 120 + 45, endRange: (60 * 3) + 15, type: 'draw down', },
	]
}

const nameRecipe = ({author, name}) => `${author.name}'s ${name}`

const testRecipes = [ultimateV60, ultimateFrenchPress, eldric];
const nameToRecipe = Object.fromEntries(map (recipe => [nameRecipe (recipe), recipe]) (testRecipes))
const unsafeLast = xs => xs[xs.length - 1]
const parsers = {
	yaml: YAML.parse,
	yml: YAML.parse,
	json: JSON.parse,
}
const parseFile = fileType => fileString => parsers[fileType.toLowerCase()] (fileString)

const MainMenu = ({setMode, setRecipe}) => {
	const [selected, setSelected] = useState ()
	const [fileRecipe, setFileRecipe] = useState ()
	const handleClick = e => setMode(e.target.name)
	const handleSelectChange = e => {
		const {value} = e.target
		setSelected (value)
		setRecipe (nameToRecipe[value])
	}
	const handleFileInputChange = e => {
		const maybeFile = e.target.files[0]
		if (!maybeFile) return
		const {name} = maybeFile
		const fileType = unsafeLast (name.split ('.'))
		maybeFile.text().then(parseFile (fileType)).then(recipe => {
			setFileRecipe (recipe)
			setRecipe (recipe)
			setSelected (recipe.name)
		})
	}
	const selectOptions = map (
		({author, name}) => ({value: name, children: nameRecipe ({author, name}), key: name})
	) (fileRecipe ? prepend (fileRecipe) (testRecipes) : testRecipes)
	return (
		<>
			<h1>welcome 2 the coffee zone</h1>
			<p>
				you can input a new recipe using 
				&nbsp;
				<button name='input' onClick={handleClick}>this form</button>
				<br/>
				or you can select one of my <label htmlFor="recipeSelect"> test recipes </label>
				<select id="recipeSelect" name="recipeSelector" value={selected} onChange={handleSelectChange}>
					{map (createNoChild ('option')) (selectOptions)
					}
				</select>
				or you can <label htmlFor="fileInput"> input a recipe you've created previously </label>
				<input id='fileInput' type="file" onChange={handleFileInputChange} />
				<br/> and view it <button name='view' onClick={handleClick}>here</button>.
			</p>
			<p>
				this site is still very much in beta so recommendations should be sent <a href="mailto:alje@daxi.ml">here</a>
			</p>
			<p>
				thanks!
			</p>
		</>
	)
}

const components = {
	main: MainMenu,
	input: InputForm,
	view: RecipeView,
};
const modes = keys (components)


function App() {
	const [mode, setMode] = useState(modes[0])
	const [recipe, setRecipe] = useState(testRecipes[0])
	const handleSetRecipe = r => {
		setMode ('view')
		setRecipe (r)
	}
  return (
		<Fragment>
			<main>
				{createNoChild (components[mode]) ({setMode, recipe, handleSetRecipe, setRecipe})}
			</main>
			<footer>
				<a href="mailto:alje@daxi.ml">contact</a>
			</footer>
		</Fragment>
  )
}

export default App;
