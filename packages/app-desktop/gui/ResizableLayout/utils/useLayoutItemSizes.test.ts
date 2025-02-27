import useLayoutItemSizes, { itemSize } from './useLayoutItemSizes';
import { LayoutItem, LayoutItemDirection } from './types';
import { renderHook } from '@testing-library/react-hooks';
import validateLayout from './validateLayout';

describe('useLayoutItemSizes', () => {

	test('should validate the layout', () => {
		const layout: LayoutItem = validateLayout({
			key: 'root',
			width: 200,
			height: 100,
			direction: LayoutItemDirection.Row,
			children: [
				{ key: 'col1' },
				{ key: 'col2' },
			],
		});

		expect(layout.isRoot).toBe(true);
	});

	test('should stretch the last visible child item if all siblings have fixed size and the last child is not visible', () => {
		const layout: LayoutItem = validateLayout({
			key: 'root',
			width: 200,
			height: 100,
			direction: LayoutItemDirection.Row,
			children: [
				{ key: 'col1', width: 50 },
				{ key: 'col2', width: 50 },
				{ key: 'col3', width: 70, visible: false },
			],
		});

		const col1 = layout.children.find(c => c.key === 'col1');
		expect(col1.width).toBe(50);
		expect(col1.visible).toBe(true);

		const col2 = layout.children.find(c => c.key === 'col2');
		expect(col2).not.toHaveProperty('width');
		expect(col2.visible).toBe(true);

		const col3 = layout.children.find(c => c.key === 'col3');
		expect(col3.width).toBe(70);
		expect(col3.visible).toBe(false);
	});

	test('should stretch the last child item if all siblings have fixed size', () => {
		const layout: LayoutItem = validateLayout({
			key: 'root',
			width: 200,
			height: 100,
			direction: LayoutItemDirection.Row,
			children: [
				{ key: 'col1', width: 50 },
				{ key: 'col2', width: 50 },
				{ key: 'col3', width: 70 },
			],
		});

		const col1 = layout.children.find(c => c.key === 'col1');
		expect(col1.width).toBe(50);
		expect(col1.visible).toBe(true);

		const col2 = layout.children.find(c => c.key === 'col2');
		expect(col2.width).toBe(50);
		expect(col2.visible).toBe(true);

		const col3 = layout.children.find(c => c.key === 'col3');
		expect(col3).not.toHaveProperty('width');
		expect(col3.visible).toBe(true);
	});

	test('should give item sizes', () => {
		const layout: LayoutItem = validateLayout({
			key: 'root',
			width: 200,
			height: 100,
			direction: LayoutItemDirection.Row,
			children: [
				{
					key: 'col1',
					width: 50,
				},
				{
					key: 'col2',
				},
			],
		});

		const { result } = renderHook(() => useLayoutItemSizes(layout));
		const sizes = result.current;

		expect(sizes.root).toEqual({ width: 200, height: 100 });
		expect(sizes.col1).toEqual({ width: 50, height: 100 });
		expect(sizes.col2).toEqual({ width: 150, height: 100 });
	});

	test('should leave room for the resizer controls', () => {
		const layout: LayoutItem = validateLayout({
			key: 'root',
			width: 200,
			height: 100,
			direction: LayoutItemDirection.Row,
			children: [
				{
					key: 'col1',
					resizableRight: true,
					direction: LayoutItemDirection.Column,
					children: [
						{ key: 'row1', resizableBottom: true },
						{ key: 'row2' },
					],
				},
				{
					key: 'col2',
				},
			],
		});

		const { result } = renderHook(() => useLayoutItemSizes(layout));

		const sizes = result.current;

		expect(sizes).toEqual({
			root: { width: 200, height: 100 },
			col1: { width: 100, height: 100 },
			col2: { width: 100, height: 100 },
			row1: { width: 100, height: 50 },
			row2: { width: 100, height: 50 },
		});

		expect(itemSize(layout.children[0], layout, sizes, true)).toEqual({ width: 100, height: 100 });

		const parent = layout.children[0];
		expect(itemSize(parent.children[0], parent, sizes, false)).toEqual({ width: 95, height: 45 });
		expect(itemSize(parent.children[1], parent, sizes, false)).toEqual({ width: 95, height: 50 });
	});

});
