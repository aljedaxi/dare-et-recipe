import './App.css'
import {useState, Fragment } from 'react'
import {InputForm} from './inputForm'
import {RecipeView} from './recipe-view'
import { createNoChild } from './util'
import {
	prepend,
	keys,
	map,
} from 'sanctuary'
import { testRecipes } from './test-recipes'
import YAML from 'yaml'
const nameRecipe = ({author, name}) => `${author.name}'s ${name}`

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
	const allRecipes = fileRecipe ? prepend (fileRecipe) (testRecipes) : testRecipes
	const nameToRecipe = Object.fromEntries(map (recipe => [recipe.name, recipe]) (allRecipes))
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
	) (allRecipes)
	return (
		<>
			<h1>welcome 2 the coffee zone</h1>
			<p>
				there&apos;re a lot of coffee recipe websites, but they don&apos;t know how to talk to one another. 
				this website is an open source recipe sharing format, and an open source recipe viewer.
				i hope to help create a more open and friendly specialty coffee ecosystem.
			</p>
			<h2>recipe sharing</h2>
			<p>
				you can input a new recipe using 
				&nbsp;
				<button name='input' onClick={handleClick}>this form</button>
			</p>
			<h2>recipe viewing</h2>
			<p>
				you can use this inputter to <label htmlFor="fileInput"> input a recipe file </label>
				<input id='fileInput' type="file" onChange={handleFileInputChange} />
				<br/>
				or you can select one of my <label htmlFor="recipeSelect"> test recipes </label>
				<select id="recipeSelect" name="recipeSelector" value={selected} onChange={handleSelectChange}>
					{
					map (createNoChild ('option')) (selectOptions)
					}
				</select>
				<br/>
				then click here to <label for="view">view your selected recipe</label> <button id='view' name='view' onClick={handleClick}>here</button>.
				<br/>
				(this viewer roughly mirrors <a href="https://aramse.coffee/recipe/">aramse's</a> recipe format.)
			</p>
			<h2>this site is in beta!</h2>
			<p>
				so please send your recommendations/hate/love <a href="mailto:alje@daxi.ml">here</a>
			</p>
			<h2>special thanks to:</h2>
			<ul>
				<li>
					<a href="https://aramse.coffee/recipe">aramse</a> for their pioneering work on a visual recipe representation. i&apos;d never&apos;d thought to make this without them.
				</li>
				<li>
					<a href="https://www.youtube.com/channel/UCMb0O2CdPBNi-QqPk5T3gsQ">James Hoffmann</a> &amp; <a href="https://harkencoffee.com/blogs/news/meet-our-founder-eldric-stuart">Eldic Stuart</a> for letting me host their recipes
				</li>
			</ul>
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
		<div id='app'>
			<main>
				{createNoChild (components[mode]) ({setMode, recipe, handleSetRecipe, setRecipe})}
			</main>
			<hr/>
			<footer>
				<a href="mailto:alje@daxi.ml">contact</a>
			</footer>
		</div>
  )
}

export default App;
