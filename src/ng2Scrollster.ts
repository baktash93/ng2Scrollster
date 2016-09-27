import {Component, ViewChild, OnInit, ElementRef, Input} from "@angular/core";

@Component({
    selector: '[ng-scrollster]',
    template: `
    <div #contentWrapper class="content-wrapper">
        <div #scrollableContent class="scrollable-content">
            <ng-content></ng-content>
        </div>
        <div #scrollBarV class="scroll-bar-v"></div>
        <div #scrollBarH class="scroll-bar-h"></div>
    </div>
    `,
    styles: [`
        :host {
            overflow: hidden;
        }
        .content-wrapper {
            position: relative;
            overflow: hidden;
        }
        .scrollable-content {
            display: inline-block;
            top: 0;
            position: relative;
        }
        .scroll-bar-h, .scroll-bar-v {
            position: absolute;
            background: #424242;
            cursor: pointer;
            opacity: 0.7;
        }
        .scroll-bar-h {
            bottom: 2px;
            height: 6px;
            border-radius: 3px;
        }
        .scroll-bar-v {
            top: 0;
            width: 5px;
            right: 2px;
            border-radius: 3px;
        }
    `]
})

export class Ng2Scrollster implements OnInit {
    @ViewChild('contentWrapper', {read: ElementRef}) contentWrapperRef;
    @ViewChild('scrollableContent', {read: ElementRef}) scrollableContentRef;
    @ViewChild('scrollBarV', {read: ElementRef}) scrollBarVRef;
    @ViewChild('scrollBarH', {read: ElementRef}) scrollBarHRef;

    @Input() barOptions;

    private SCROLL_DISTANCE;
    private scrollableContent;
    private contentWrapper;
    private scrollBarV;
    private scrollBarH;
    private wheelHandler;

    ngOnInit() : void {
        this.initWheelHandler();
        this.init();
    }

    private scrollContent (target, delta, distance, isTargetRelativeToBoundary: boolean) : void {
        let top = parseFloat(getComputedStyle(target).top);
        let scrollableDistance = top + (delta * distance);


        if(isTargetRelativeToBoundary){
            let scrollLimit = this.contentWrapper.clientHeight - this.scrollBarV.offsetHeight;

            if(scrollableDistance <= 0) {
                this.setTop(target, 0);
                return;
            } else if ((target.offsetHeight + scrollableDistance) >= this.contentWrapper.clientHeight) {
                this.setTop(target, scrollLimit);
                return;
            }
            this.setTop(target, scrollableDistance);
        } else {
            if(scrollableDistance >= 0) {
                this.setTop(target, 0);
                return;
            } else if ((parseInt(target.offsetHeight) - Math.abs(scrollableDistance)) <= parseInt(this.contentWrapper.clientHeight)) {
                this.setTop(target, -1 * (parseInt(target.offsetHeight) - parseInt(this.contentWrapper.offsetHeight)));
                return;
            }
            this.setTop(target, scrollableDistance);
        }
    }

    private dragContentV(target, distance, isTargetRelativeToBoundary) : void {
        if(isTargetRelativeToBoundary){
            let scrollLimit = this.contentWrapper.clientHeight - this.scrollBarV.offsetHeight;
            if(distance <= 0) {
                this.setTop(target, 0);
                return;
            }
            else if ((target.offsetHeight + distance) >= this.contentWrapper.clientHeight) {
                this.setTop(target, scrollLimit);
                return;
            }
            this.setTop(target, distance);
        } else {
            if(distance >= 0) {
                this.setTop(target, 0);
                return;
            } else if ((parseInt(target.offsetHeight) - Math.abs(distance)) <= parseInt(this.contentWrapper.clientHeight)) {
                this.setTop(target, -1 * (parseInt(target.offsetHeight) - parseInt(this.contentWrapper.offsetHeight)));
                return;
            }
            this.setTop(target, distance);
        }
    }

    private dragContentH(target, distance, isTargetRelativeToBoundary) : void {
            if(isTargetRelativeToBoundary){
                let dragLimit = this.contentWrapper.clientWidth - this.scrollBarH.offsetWidth;
                if(distance <= 0) {
                    this.setLeft(target, 0);
                    return;
                }
                else if ((target.offsetWidth + distance) >= this.contentWrapper.clientWidth) {
                    this.setLeft(target, dragLimit);
                    return;
                }
                this.setLeft(target, distance);
            } else {
            if(distance >= 0) {
                this.setLeft(target, 0);
                return;
            } else if ((parseInt(target.offsetWidth) - Math.abs(distance)) <= parseInt(this.contentWrapper.clientWidth)) {
                this.setLeft(target, -1 * (parseInt(target.offsetWidth) - parseInt(this.contentWrapper.offsetWidth)));
                return;
            }
            this.setLeft(target, distance);
        }
    }

    private getWheelDelta (evt : any) : number {
        return evt.deltaY > 0 ? -1 : 1
    }

    private initWheelScroll () : void {
        this.contentWrapper.addEventListener('wheel', this.getWheelHandler());
    }

    private resetWheelScroll () : void {
        this.contentWrapper.removeEventListener('wheel', this.getWheelHandler());
    }

    private setContainerHeight () : void {
        this.contentWrapper.style.height = !(this.contentWrapper.parentNode.clientHeight < 150) ?
            this.contentWrapper.parentNode.clientHeight : 300;
    }

    private setTop(el, top) : void {
        el.style.top = top;
    }

    private setLeft(el, left) : void {
        el.style.left = left;
    }

    initVerticalScroll () : void {
        let isScrollable;

        setTimeout(() => {
            let barLength = parseInt(this.contentWrapper.clientHeight) /
                parseInt(this.scrollableContent.clientHeight) * parseInt(this.contentWrapper.clientHeight);
            isScrollable = barLength < this.contentWrapper.clientHeight ? true : false;

            if(!isScrollable) {
                this.resetWheelScroll();
                this.scrollBarV.style.height = '0px';
                this.scrollBarV.style.top = '0px';
                this.scrollableContent.style.top = '0px';
                return;
            }
            this.scrollBarV.style.height = barLength;

            this.initBarCSS();
            this.initBarDrag();
            this.initWheelScroll();
        }, 1);
    }

    initHorizontalScroll () : void {
        let isScrollable;

        setTimeout(() => {
            this.scrollableContent.style.width = 'unset';

            let barLength = parseInt(this.contentWrapper.offsetWidth) /
                parseInt(this.scrollableContent.offsetWidth) * parseInt(this.contentWrapper.offsetWidth);

            isScrollable = barLength < this.contentWrapper.clientWidth ? true : false;

            if(!isScrollable) {
                this.scrollableContent.style.width = '100%';
                this.scrollableContent.style.left = '0px';
                this.scrollBarH.style.width = 'unset';
                return;
            }

            this.scrollBarH.style.width = barLength;
            this.initHBarDrag();
            this.initBarCSS();
        }, 1);
    }

    private initHBarDrag() : void {
        let isBarDragging = false,
            startPosX;

        this.scrollBarH.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isBarDragging = true;

            startPosX = this.scrollBarH.offsetLeft;
        });
        window.addEventListener('mousemove', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if(!isBarDragging) return;

            let mouseInnerPosX = e.pageX - this.contentWrapper.offsetLeft;
            let currentPosX = mouseInnerPosX - .5 * this.scrollBarH.offsetWidth;


            this.dragContentH(this.scrollBarH, currentPosX, true);
            this.dragContentH(this.scrollableContent, -(currentPosX * (this.scrollableContent.clientWidth/this.contentWrapper.clientWidth)), false);
        })
        window.addEventListener('mouseup', (e) => {
            if(!isBarDragging) return;
            isBarDragging = false;
        })
    }

    private initBarDrag(): void {
        let isBarDragging = false,
            startPosY;

        this.scrollBarV.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isBarDragging = true;

            startPosY = this.scrollBarV.offsetTop;
        });
        window.addEventListener('mousemove', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if(!isBarDragging) return;

            let mouseInnerPosY = e.pageY - this.contentWrapper.offsetTop;
            let currentPosY = mouseInnerPosY - .5 * this.scrollBarV.offsetHeight;

            this.dragContentV(this.scrollBarV, currentPosY, true);
            this.dragContentV(this.scrollableContent, -(currentPosY * (this.scrollableContent.clientHeight/this.contentWrapper.clientHeight)), false);
        })
        window.addEventListener('mouseup', (e) => {
            if(!isBarDragging) return;
            isBarDragging = false;
        })
    }

    private watchScrollableContent() : void {
        let initialHeight = this.scrollableContent.offsetHeight,
            initialWidth = this.scrollableContent.offsetWidth;
        this.contentWrapper.addEventListener('sizeChange', (e) => {
            this.initVerticalScroll();
            this.initHorizontalScroll();
        });

        setInterval(() => {
            let sizeChangeEvent = new Event('sizeChange');
            let currentHeight = this.scrollableContent.offsetHeight,
                currentWidth = this.scrollableContent.offsetWidth;

            if(initialHeight !== this.scrollableContent.offsetHeight || initialWidth !== this.scrollableContent.offsetWidth){
                initialHeight = currentHeight;
                initialWidth = currentWidth;
                this.contentWrapper.dispatchEvent(sizeChangeEvent);
            }
        }, 500);
    }

    private initBarCSS() : void {
        let options = this.barOptions;
        if(typeof options !== 'object') return;

        for(let property in options){
            this.scrollBarV.style[property] = options[property];
            this.scrollBarH.style[property] = options[property];
        }
    }

    private initWheelHandler () {
        let self = this;
        this.wheelHandler = (e) => {
            let delta = self.getWheelDelta(e);
            let distance = self.SCROLL_DISTANCE;
            self.scrollContent(self.scrollableContent, delta, distance, false);
            self.scrollContent(self.scrollBarV, delta, -(distance * (self.contentWrapper.clientHeight/self.scrollableContent.clientHeight)), true);
        }
    }

    private getWheelHandler () : any {
        return this.wheelHandler;
    }

    init () : void {
        this.SCROLL_DISTANCE = 100;
        this.scrollableContent = this.scrollableContentRef.nativeElement;
        this.contentWrapper = this.contentWrapperRef.nativeElement;
        this.scrollBarV = this.scrollBarVRef.nativeElement;
        this.scrollBarH = this.scrollBarHRef.nativeElement;
        this.initVerticalScroll();
        this.initHorizontalScroll();
        this.watchScrollableContent();
        this.setContainerHeight();
    }
}

