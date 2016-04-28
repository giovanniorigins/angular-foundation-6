import angular from "angular";
import mocks from "angular-mocks";

import "src/pagination/pagination.js"
import "src/pagination/pagination.html.js"
import "src/pagination/pager.html.js"

describe('pagination directive', function () {

  var inject = mocks.inject;
  var module = mocks.module;

  var $compile, $rootScope, element;
  beforeEach(module('mm.foundation.pagination'));
  beforeEach(module('template/pagination/pagination.html'));
  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $rootScope.total = 47; // 5 pages
    $rootScope.currentPage = 3;
    element = $compile('<pagination total-items="total" page="currentPage"></pagination>')($rootScope);
    $rootScope.$digest();
  }));

  function getPaginationBarSize() {
    return element.find('li').length;
  }

  function getPaginationEl(index) {
    return element.find('li').eq(index);
  }

  function clickPaginationEl(index) {
    getPaginationEl(index)[0].querySelector('a').click();
  }

  function updateCurrentPage(value) {
    $rootScope.currentPage = value;
    $rootScope.$digest();
  }

  it('has a "pagination" css class', function() {
    expect(element.hasClass('pagination')).toBe(true);
  });

  it('contains num-pages + 2 li elements', function() {
    expect(getPaginationBarSize()).toBe(7);
    expect(getPaginationEl(0).text().trim()).toBe('Previous');
    expect(getPaginationEl(-1).text().trim()).toBe('Next');
  });

  it('has the number of the page as text in each page item', function() {
    for (var i = 1; i <= 5; i++) {
      expect(getPaginationEl(i).text().trim()).toEqual(''+i);
    }
  });

  it('sets the current page to be current', function() {
    expect(getPaginationEl($rootScope.currentPage).hasClass('current')).toBe(true);
  });

  it('disables the "previous" link if current page is 1', function() {
    updateCurrentPage(1);
    expect(getPaginationEl(0).hasClass('unavailable')).toBe(true);
  });

  it('disables the "next" link if current page is last', function() {
    updateCurrentPage(5);
    expect(getPaginationEl(-1).hasClass('unavailable')).toBe(true);
  });

  it('changes currentPage if a page link is clicked', function() {
    clickPaginationEl(2);
    expect($rootScope.currentPage).toBe(2);
  });

  it('changes currentPage if the "previous" link is clicked', function() {
    clickPaginationEl(0);
    expect($rootScope.currentPage).toBe(2);
  });

  it('changes currentPage if the "next" link is clicked', function() {
    clickPaginationEl(-1);
    expect($rootScope.currentPage).toBe(4);
  });

  it('does not change the current page on "previous" click if already at first page', function() {
    updateCurrentPage(1);
    clickPaginationEl(0);
    expect($rootScope.currentPage).toBe(1);
  });

  it('does not change the current page on "next" click if already at last page', function() {
    updateCurrentPage(5);
    clickPaginationEl(-1);
    expect($rootScope.currentPage).toBe(5);
  });

  it('changes the number of pages when `total-items` changes', function() {
    $rootScope.total = 78; // 8 pages
    $rootScope.$digest();

    expect(getPaginationBarSize()).toBe(10);
    expect(getPaginationEl(0).text().trim()).toBe('Previous');
    expect(getPaginationEl(-1).text().trim()).toBe('Next');
  });

  it('does not "break" when `total-items` is undefined', function() {
    $rootScope.total = undefined;
    $rootScope.$digest();

    expect(getPaginationBarSize()).toBe(3); // Previous, 1, Next
    expect(getPaginationEl(0)).toHaveClass('unavailable');
    expect(getPaginationEl(1)).toHaveClass('current');
    expect(getPaginationEl(2)).toHaveClass('unavailable');
  });

  it('does not "break" when `total-items` is negative', function() {
    $rootScope.total = -1;
    $rootScope.$digest();

    expect(getPaginationBarSize()).toBe(3); // Previous, 1, Next
    expect(getPaginationEl(0)).toHaveClass('unavailable');
    expect(getPaginationEl(1)).toHaveClass('current');
    expect(getPaginationEl(2)).toHaveClass('unavailable');
  });

  it('does not change the current page when `total-items` changes but is valid', function() {
    $rootScope.currentPage = 1;
    $rootScope.total = 18; // 2 pages
    $rootScope.$digest();

    expect($rootScope.currentPage).toBe(1);
  });

  describe('`items-per-page`', function () {
    beforeEach(inject(function() {
      $rootScope.perpage = 5;
      element = $compile('<pagination total-items="total" items-per-page="perpage" page="currentPage" on-select-page="selectPageHandler(page)"></pagination>')($rootScope);
      $rootScope.$digest();
    }));

    it('changes the number of pages', function() {
      expect(getPaginationBarSize()).toBe(12);
      expect(getPaginationEl(0).text().trim()).toBe('Previous');
      expect(getPaginationEl(-1).text().trim()).toBe('Next');
    });

    it('changes the number of pages when changes', function() {
      $rootScope.perpage = 20;
      $rootScope.$digest();

      expect(getPaginationBarSize()).toBe(5);
      expect(getPaginationEl(0).text().trim()).toBe('Previous');
      expect(getPaginationEl(-1).text().trim()).toBe('Next');
    });

    it('selects the last page when current page is too big', function() {
      $rootScope.perpage = 30;
      $rootScope.$digest();

      expect($rootScope.currentPage).toBe(2);
      expect(getPaginationBarSize()).toBe(4);
      expect(getPaginationEl(0).text().trim()).toBe('Previous');
      expect(getPaginationEl(-1).text().trim()).toBe('Next');
    });

    it('displays a single page when it is negative', function() {
      $rootScope.perpage = -1;
      $rootScope.$digest();

      expect(getPaginationBarSize()).toBe(3);
      expect(getPaginationEl(0).text().trim()).toBe('Previous');
      expect(getPaginationEl(1).text().trim()).toBe('1');
      expect(getPaginationEl(-1).text().trim()).toBe('Next');
    });
  });

  describe('executes `on-select-page` expression', function () {
    beforeEach(inject(function() {
      $rootScope.selectPageHandler = jasmine.createSpy('selectPageHandler');
      element = $compile('<pagination total-items="total" page="currentPage" on-select-page="selectPageHandler(page)"></pagination>')($rootScope);
      $rootScope.$digest();
    }));

    it('when an element is clicked', function() {
      clickPaginationEl(2);
      expect($rootScope.selectPageHandler).toHaveBeenCalledWith(2);
    });
  });

  describe('when `page` is not a number', function () {
    it('handles numerical string', function() {
      updateCurrentPage('2');
      expect(getPaginationEl(2)).toHaveClass('current');

      updateCurrentPage('04');
      expect(getPaginationEl(4)).toHaveClass('current');
    });

    it('defaults to 1 if non-numeric', function() {
      updateCurrentPage('pizza');
      expect(getPaginationEl(1)).toHaveClass('current');
    });
  });

  describe('with `max-size` option', function () {
    beforeEach(inject(function() {
      $rootScope.total = 98; // 10 pages
      $rootScope.currentPage = 3;
      $rootScope.maxSize = 5;
      element = $compile('<pagination total-items="total" page="currentPage" max-size="maxSize"></pagination>')($rootScope);
      $rootScope.$digest();
    }));

    it('contains maxsize + 2 li elements', function() {
      expect(getPaginationBarSize()).toBe($rootScope.maxSize + 2);
      expect(getPaginationEl(0).text().trim()).toBe('Previous');
      expect(getPaginationEl(-1).text().trim()).toBe('Next');
    });

    it('shows the page number even if it can\'t be shown in the middle', function() {
      updateCurrentPage(1);
      expect(getPaginationEl(1)).toHaveClass('current');

      updateCurrentPage(10);
      expect(getPaginationEl(-2)).toHaveClass('current');
    });

    it('shows the page number in middle after the next link is clicked', function() {
      updateCurrentPage(6);
      clickPaginationEl(-1);

      expect($rootScope.currentPage).toBe(7);
      expect(getPaginationEl(3)).toHaveClass('current');
      expect(getPaginationEl(3).text().trim()).toBe(''+$rootScope.currentPage);
    });

    it('shows the page number in middle after the prev link is clicked', function() {
      updateCurrentPage(7);
      clickPaginationEl(0);

      expect($rootScope.currentPage).toBe(6);
     expect(getPaginationEl(3)).toHaveClass('current');
      expect(getPaginationEl(3).text().trim()).toBe(''+$rootScope.currentPage);
    });

    it('changes pagination bar size when max-size value changed', function() {
      $rootScope.maxSize = 7;
      $rootScope.$digest();
      expect(getPaginationBarSize()).toBe(9);
    });

    it('sets the pagination bar size to num-pages, if max-size is greater than num-pages ', function() {
      $rootScope.maxSize = 15;
      $rootScope.$digest();
      expect(getPaginationBarSize()).toBe(12);
    });

    it('should not change value of max-size expression, if max-size is greater than num-pages ', function() {
      $rootScope.maxSize = 15;
      $rootScope.$digest();
      expect($rootScope.maxSize).toBe(15);
    });

    it('should not display page numbers, if max-size is zero', function() {
      $rootScope.maxSize = 0;
      $rootScope.$digest();
      expect(getPaginationBarSize()).toBe(2);
      expect(getPaginationEl(0).text().trim()).toBe('Previous');
      expect(getPaginationEl(-1).text().trim()).toBe('Next');
    });
  });

  describe('with `max-size` option & no `rotate`', function () {
    beforeEach(inject(function() {
      $rootScope.total = 115; // 12 pages
      $rootScope.currentPage = 7;
      $rootScope.maxSize = 5;
      $rootScope.rotate = false;
      element = $compile('<pagination total-items="total" page="currentPage" max-size="maxSize" rotate="rotate"></pagination>')($rootScope);
      $rootScope.$digest();
    }));

    it('contains maxsize + 4 elements', function() {
      expect(getPaginationBarSize()).toBe($rootScope.maxSize + 4);
      expect(getPaginationEl(0).text().trim()).toBe('Previous');
      expect(getPaginationEl(1).text().trim()).toBe('...');
      expect(getPaginationEl(2).text().trim()).toBe('6');
      expect(getPaginationEl(-3).text().trim()).toBe('10');
      expect(getPaginationEl(-2).text().trim()).toBe('...');
      expect(getPaginationEl(-1).text().trim()).toBe('Next');
    });

    it('shows only the next ellipsis element on first page set', function() {
      updateCurrentPage(3);
      expect(getPaginationEl(1).text().trim()).toBe('1');
      expect(getPaginationEl(-3).text().trim()).toBe('5');
      expect(getPaginationEl(-2).text().trim()).toBe('...');
    });

    it('shows only the previous ellipsis element on last page set', function() {
      updateCurrentPage(12);
      expect(getPaginationBarSize()).toBe(5);
      expect(getPaginationEl(1).text().trim()).toBe('...');
      expect(getPaginationEl(2).text().trim()).toBe('11');
      expect(getPaginationEl(-2).text().trim()).toBe('12');
    });

    it('moves to the previous set when first ellipsis is clicked', function() {
      expect(getPaginationEl(1).text().trim()).toBe('...');

      clickPaginationEl(1);

      expect($rootScope.currentPage).toBe(5);
      expect(getPaginationEl(-3)).toHaveClass('current');
    });

    it('moves to the next set when last ellipsis is clicked', function() {
      expect(getPaginationEl(-2).text().trim()).toBe('...');

      clickPaginationEl(-2);

      expect($rootScope.currentPage).toBe(11);
      expect(getPaginationEl(2)).toHaveClass('current');
    });

    it('should not display page numbers, if max-size is zero', function() {
      $rootScope.maxSize = 0;
      $rootScope.$digest();

      expect(getPaginationBarSize()).toBe(2);
      expect(getPaginationEl(0).text().trim()).toBe('Previous');
      expect(getPaginationEl(1).text().trim()).toBe('Next');
    });
  });

  describe('pagination directive with `boundary-links`', function () {
    beforeEach(inject(function() {
      element = $compile('<pagination boundary-links="true" total-items="total" page="currentPage"></pagination>')($rootScope);
      $rootScope.$digest();
    }));

    it('contains num-pages + 4 li elements', function() {
      expect(getPaginationBarSize()).toBe(9);
      expect(getPaginationEl(0).text().trim()).toBe('First');
      expect(getPaginationEl(1).text().trim()).toBe('Previous');
      expect(getPaginationEl(-2).text().trim()).toBe('Next');
      expect(getPaginationEl(-1).text().trim()).toBe('Last');
    });

    it('has first and last li elements visible', function() {
      expect(getPaginationEl(0).css('display')).not.toBe('none');
      expect(getPaginationEl(-1).css('display')).not.toBe('none');
    });


    it('disables the "first" & "previous" link if current page is 1', function() {
      updateCurrentPage(1);

      expect(getPaginationEl(0)).toHaveClass('unavailable');
      expect(getPaginationEl(1)).toHaveClass('unavailable');
    });

    it('disables the "last" & "next" link if current page is num-pages', function() {
      updateCurrentPage(5);

      expect(getPaginationEl(-2)).toHaveClass('unavailable');
      expect(getPaginationEl(-1)).toHaveClass('unavailable');
    });

    it('changes currentPage if the "first" link is clicked', function() {
      clickPaginationEl(0);
      expect($rootScope.currentPage).toBe(1);
    });

    it('changes currentPage if the "last" link is clicked', function() {
      clickPaginationEl(-1);
      expect($rootScope.currentPage).toBe(5);
    });

    it('does not change the current page on "first" click if already at first page', function() {
      updateCurrentPage(1);
      clickPaginationEl(0);
      expect($rootScope.currentPage).toBe(1);
    });

    it('does not change the current page on "last" click if already at last page', function() {
      updateCurrentPage(5);
      clickPaginationEl(-1);
      expect($rootScope.currentPage).toBe(5);
    });

    it('changes "first" & "last" text from attributes', function() {
      element = $compile('<pagination boundary-links="true" first-text="<<<" last-text=">>>" total-items="total" page="currentPage"></pagination>')($rootScope);
      $rootScope.$digest();

      expect(getPaginationEl(0).text().trim()).toBe('<<<');
      expect(getPaginationEl(-1).text().trim()).toBe('>>>');
    });

    it('changes "previous" & "next" text from attributes', function() {
      element = $compile('<pagination boundary-links="true" previous-text="<<" next-text=">>" total-items="total" page="currentPage"></pagination>')($rootScope);
      $rootScope.$digest();

      expect(getPaginationEl(1).text().trim()).toBe('<<');
      expect(getPaginationEl(-2).text().trim()).toBe('>>');
    });

    it('changes "first" & "last" text from interpolated attributes', function() {
      $rootScope.myfirstText = '<<<';
      $rootScope.mylastText = '>>>';
      element = $compile('<pagination boundary-links="true" first-text="{{myfirstText}}" last-text="{{mylastText}}" total-items="total" page="currentPage"></pagination>')($rootScope);
      $rootScope.$digest();

      expect(getPaginationEl(0).text().trim()).toBe('<<<');
      expect(getPaginationEl(-1).text().trim()).toBe('>>>');
    });

    it('changes "previous" & "next" text from interpolated attributes', function() {
      $rootScope.previousText = '<<';
      $rootScope.nextText = '>>';
      element = $compile('<pagination boundary-links="true" previous-text="{{previousText}}" next-text="{{nextText}}" total-items="total" page="currentPage"></pagination>')($rootScope);
      $rootScope.$digest();

      expect(getPaginationEl(1).text().trim()).toBe('<<');
      expect(getPaginationEl(-2).text().trim()).toBe('>>');
    });
  });

  describe('pagination directive with just number links', function () {
    beforeEach(inject(function() {
      element = $compile('<pagination direction-links="false" total-items="total" page="currentPage"></pagination>')($rootScope);
      $rootScope.$digest();
    }));

    it('contains num-pages li elements', function() {
      expect(getPaginationBarSize()).toBe(5);
      expect(getPaginationEl(0).text().trim()).toBe('1');
      expect(getPaginationEl(-1).text().trim()).toBe('5');
    });

    it('has the number of the page as text in each page item', function() {
      for(var i = 0; i < 5; i++) {
        expect(getPaginationEl(i).text().trim()).toEqual(''+(i+1));
      }
    });

    it('sets the current page to be current', function() {
      expect(getPaginationEl(2)).toHaveClass('current');
    });

    it('does not disable the "1" link if current page is 1', function() {
      updateCurrentPage(1);

      expect(getPaginationEl(0)).not.toHaveClass('unavailable');
      expect(getPaginationEl(0)).toHaveClass('current');
    });

    it('does not disable the "last" link if current page is last page', function() {
      updateCurrentPage(5);

      expect(getPaginationEl(-1)).not.toHaveClass('unavailable');
      expect(getPaginationEl(-1)).toHaveClass('current');
    });

    it('changes currentPage if a page link is clicked', function() {
      clickPaginationEl(1);
      expect($rootScope.currentPage).toBe(2);
    });

    it('changes the number of items when total items changes', function() {
      $rootScope.total = 73; // 8 pages
      $rootScope.$digest();

      expect(getPaginationBarSize()).toBe(8);
      expect(getPaginationEl(0).text().trim()).toBe('1');
      expect(getPaginationEl(-1).text().trim()).toBe('8');
    });
  });

  describe('with just boundary & number links', function () {
    beforeEach(inject(function() {
      $rootScope.directions = false;
      element = $compile('<pagination boundary-links="true" direction-links="directions" total-items="total" page="currentPage"></pagination>')($rootScope);
      $rootScope.$digest();
    }));

    it('contains number of pages + 2 li elements', function() {
      expect(getPaginationBarSize()).toBe(7);
      expect(getPaginationEl(0).text().trim()).toBe('First');
      expect(getPaginationEl(1).text().trim()).toBe('1');
      expect(getPaginationEl(-2).text().trim()).toBe('5');
      expect(getPaginationEl(-1).text().trim()).toBe('Last');
    });

    it('disables the "first" & activates "1" link if current page is 1', function() {
      updateCurrentPage(1);

      expect(getPaginationEl(0)).toHaveClass('unavailable');
      expect(getPaginationEl(1)).not.toHaveClass('unavailable');
      expect(getPaginationEl(1)).toHaveClass('current');
    });

    it('disables the "last" & "next" link if current page is num-pages', function() {
      updateCurrentPage(5);

      expect(getPaginationEl(-2)).toHaveClass('current');
      expect(getPaginationEl(-2)).not.toHaveClass('unavailable');
      expect(getPaginationEl(-1)).toHaveClass('unavailable');
    });
  });

  describe('`num-pages`', function () {
    beforeEach(inject(function() {
      $rootScope.numpg = null;
      element = $compile('<pagination total-items="total" page="currentPage" num-pages="numpg"></pagination>')($rootScope);
      $rootScope.$digest();
    }));

    it('equals to total number of pages', function() {
      expect($rootScope.numpg).toBe(5);
    });

    it('changes when total number of pages change', function() {
      $rootScope.total = 73; // 8 pages
      $rootScope.$digest();
      expect($rootScope.numpg).toBe(8);
    });

    it('shows minimun one page if total items are not defined and does not break binding', function() {
      $rootScope.total = undefined;
      $rootScope.$digest();
      expect($rootScope.numpg).toBe(1);

      $rootScope.total = 73; // 8 pages
      $rootScope.$digest();
      expect($rootScope.numpg).toBe(8);
    });
  });

  describe('setting `paginationConfig`', function() {
    var originalConfig = {};
    beforeEach(inject(function(paginationConfig) {
      angular.extend(originalConfig, paginationConfig);
      paginationConfig.itemsPerPage = 5;
      paginationConfig.boundaryLinks = true;
      paginationConfig.directionLinks = true;
      paginationConfig.firstText = 'FI';
      paginationConfig.previousText = 'PR';
      paginationConfig.nextText = 'NE';
      paginationConfig.lastText = 'LA';
      element = $compile('<pagination total-items="total" page="currentPage"></pagination>')($rootScope);
      $rootScope.$digest();
    }));
    afterEach(inject(function(paginationConfig) {
      // return it to the original stat
      angular.extend(paginationConfig, originalConfig);
    }));

    it('should change paging text', function () {
      expect(getPaginationEl(0).text().trim()).toBe('FI');
      expect(getPaginationEl(1).text().trim()).toBe('PR');
      expect(getPaginationEl(-2).text().trim()).toBe('NE');
      expect(getPaginationEl(-1).text().trim()).toBe('LA');
    });

    it('contains number of pages + 4 li elements', function() {
      expect(getPaginationBarSize()).toBe(14);
    });
  });

  describe('override configuration from attributes', function () {
    beforeEach(inject(function() {
      element = $compile('<pagination boundary-links="true" first-text="<<" previous-text="<" next-text=">" last-text=">>" total-items="total" page="currentPage"></pagination>')($rootScope);
      $rootScope.$digest();
    }));

    it('contains number of pages + 4 li elements', function() {
      expect(getPaginationBarSize()).toBe(9);
    });

    it('should change paging text from attribute', function () {
      expect(getPaginationEl(0).text().trim()).toBe('<<');
      expect(getPaginationEl(1).text().trim()).toBe('<');
      expect(getPaginationEl(-2).text().trim()).toBe('>');
      expect(getPaginationEl(-1).text().trim()).toBe('>>');
    });
  });

});