import {useMemo, useState, useEffect} from 'react';
// import querySearch from 'stringquery';
import {useStopwatch} from 'react-timer-hook';
// import {useLocation} from 'react-router-dom';
/*
 * Hoffmann: {water: 100, coffee: 6}
 */

const compose = f => g => x => f(g(x));
const multiplyBy = x => y => x * y;
const divideBy = d => n => n / d;

export const useRatio = ({water = 100, coffee = 6} = {}) => {
	const c = coffee / water;
	return useMemo(_ => ({
		waterToCoffee: compose (Math.round) (multiplyBy (c)),
		coffeeToWater: compose (Math.round) (divideBy (c))
	}), [c]);
};

export const useOrientation = _ => {
	const [portrait, setPortrait] = useState(window.innerHeight > window.innerWidth);
	const landscape = !portrait;
	useEffect(_ => {
		const handleResize = _ => setPortrait(window.innerHeight > window.innerWidth);
		window.addEventListener('resize', handleResize);
		return _ => {window.removeEventListener('resize', handleResize);}
	}, []);
	return {
		isPortrait: portrait,
		isLandscape: landscape,
		landscape, portrait
	};
};

// const parseInts = x => parseInt(x) || x;

// export const useSearch = _ => {
// 	const {search} = useLocation();
// 	const searchData = querySearch(search);
// 	return Object.fromEntries(Object.entries(searchData).map(parseInts));
// };

export const useSeconds = _ => {
	const {
		pause, start, isRunning, 
		seconds: rawSeconds, minutes
	} = useStopwatch();
	const seconds = rawSeconds + (minutes * 60);
	return {pause, start, isRunning, seconds, rawSeconds, minutes};
};
