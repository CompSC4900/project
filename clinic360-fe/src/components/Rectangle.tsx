/*
 * Reactangle
 * Rectangular container that respons well to height and width
 * limitations. Designed for use as a direct decendent of a
 * vertical flex cointainer.
 */

import React, { useState, useLayoutEffect, useRef, ReactNode } from "react";

interface Props {
    aspectRatio: number
    className?: string
    children?: ReactNode
}

interface Dim {
    width: number
    height: number
}

function aspectRatioOf(dim: Dim) {
    return dim.width / dim.height;
}

function getPadding(elem: HTMLElement): Dim {
    const computedStyle = window.getComputedStyle(elem);
    return {
        width: parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight),
        height: parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom),
    };
}

function useElementSize(ref: React.RefObject<HTMLDivElement>) {
    const [parentSize, setParentSize] = useState<Dim>({width: 0, height: 0});
    const [siblingSizes, setSiblingSizes] = useState<Dim[]>([]);

    useLayoutEffect(() => {
        function updateSizes() {
            if (!ref.current) return;

            const parent = ref.current.parentElement;
            if (parent) {
                const padding = getPadding(parent);
                setParentSize({
                    width: parent.clientWidth - padding.width,
                    height: parent.clientHeight - padding.height,
                });
            }
            if (!parent) {
                throw new Error("Rectangle component must be used within a container");
            }

            const siblings = Array.from(parent.children).filter(
                child => child !== ref.current
            );
            const siblingMeasurements = siblings.map(sibling => {
                const rect = sibling.getBoundingClientRect();
                return {
                    width: rect.width,
                    height: rect.height
                };
            });
            setSiblingSizes(siblingMeasurements);
        }

        updateSizes();

        const resizeObserver = new ResizeObserver(updateSizes);
        if (ref.current?.parentElement) {
            resizeObserver.observe(ref.current.parentElement);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [ref]);

    return { parentSize, siblingSizes };
}

export default function Rectangle({aspectRatio, className, children}: Props) {
    const elementRef = useRef<HTMLDivElement>(null);
    const { parentSize, siblingSizes } = useElementSize(elementRef);

    const availableSpace = {
        width: parentSize.width,
        height: parentSize.height - siblingSizes.reduce((sum, e) => sum += e.height, 0),
    }

    let width: number | undefined;
    let height: number | undefined;
    if (aspectRatioOf(availableSpace) > aspectRatio) {
        height = availableSpace.height;
        width = height * aspectRatio;
    } else {
        width = availableSpace.width;
        height = width / aspectRatio;
    }

    return (
        <div
            ref={elementRef} 
            className={className}
            style={{height: height, width: width, alignSelf: "center"}}
        >
            {children}
        </div>
    );
}