// import React, {useState, useEffect} from 'react';
// import {useHotkeys} from 'react-hotkeys-hook';
// import { add, sub, } from 'sanctuary'

// export const useOrientation = _ => {
// 	const [portrait, setPortrait] = useState(window.innerHeight > window.innerWidth);
// 	const landscape = !portrait;
// 	useEffect(_ => {
// 		const handleResize = _ => setPortrait(window.innerHeight > window.innerWidth);
// 		window.addEventListener('resize', handleResize);
// 		return _ => {window.removeEventListener('resize', handleResize);}
// 	}, []);
// 	return {
// 		isPortrait: portrait,
// 		isLandscape: landscape,
// 		landscape, portrait
// 	};
// };

// const portraitArrows = {
// 	display: 'flex',
// 	height: '100%',
// 	flexDirection: 'column',
// 	alignItems: 'center',
// };
// const landscapeArrows = {
// 	display: 'flex',
// 	height: '100%',
// 	flexDirection: 'row',
// 	alignItems: 'center',
// };

// const succ = add (1)
// const pred = sub (1)

// const mainStyle = {
// 	background: 'black',
// 	color: 'white',
// 	width: '50%',
// 	height: '50%',
// 	display: 'grid',
// 	placeItems: 'center',
// };

// const pageStyle = {
// 	display: 'grid',
// 	placeItems: 'center',
// 	height: '100%',
// 	width: '100%',
// };

// const Basic = ({children}) =>
// 	<div style={pageStyle}>
// 		<main style={mainStyle}>
// 			{children}
// 		</main>
// 	</div>

// const BloomFrame = _ =>
// 	<iframe style={{position: 'fixed', left: 69, top: 69}} src="https://www.youtube.com/embed/IxBQ8Er8DYc" frameBorder="0" allow="autoplay" title='bloom'/>

// export const Layout = ({children, next, from}) => {
// 	const {portrait} = useOrientation();
// 	const showArrows = next && from;
// 	const containerStyle = portrait ? portraitArrows        : landscapeArrows;
// 	const fromStyle      = portrait ? {marginTop: '10%'}    : {marginLeft: '10%'};
// 	const nextStyle      = portrait ? {marginBottom: '10%'} : {marginRight: '10%'};
// 	return showArrows
// 		? (
// 			<div style={containerStyle}>
// 				<Link style={{...urlStyle, ...fromStyle}} to={from}>
// 					&lt;=
// 				</Link>
// 				<Basic>{children}</Basic>
// 				<Link style={{...urlStyle, ...nextStyle}} to={next}>
// 					=&gt;
// 				</Link>
// 			</div>
// 		)
// 		: <Basic>{children}</Basic>;
// }

// export const Steps = props => {
// 	console.log('props', props);
// 	const { events } = props
// 	const [step, setStep] = useState (1)
// 	const handleSucc = _ => setStep (succ)
// 	const handlePred = _ => setStep (pred)

// 	const eventAtStep = events[step - 1]
// 	console.log('eventAtStep', eventAtStep);

// 	useHotkeys('right', handleSucc, {}, [])
// 	useHotkeys('left',  handlePred, {}, [])
// 			// {blooming ? <BloomFrame/> : null}
// 			// {showTimer && <Timer/>}

// 	const {type, quantity} = eventAtStep
// 	const desc = `${type} ${quantity ? `until ${quantity}` : ''}`
// 		// .split(' ')
// 		// .flatMap(
// 		// 	s => s === 'bloom' 
// 		// 		? [<span onClick={beginBlooming}>bloom</span>, ' '] 
// 		// 		: [s, ' ']
// 		// )

// 	const containerStyle = {}

// 	return (
// 		<Layout>
// 			<div style={containerStyle}>
// 				<div style={{width: '60%', height: '100%', display: 'grid', placeItems: 'center'}}>
// 					<div style={{maxWidth: '90%'}}>
// 						{desc}
// 					</div>
// 				</div>
// 			</div>
// 		</Layout>
// 	)
// }
