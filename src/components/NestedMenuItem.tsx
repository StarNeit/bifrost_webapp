import {
  useState, useRef, useImperativeHandle, forwardRef,
} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Menu, { MenuProps as MuiMenuProps } from '@material-ui/core/Menu';
import MenuItem, { MenuItemProps as MuiMenuItemProps } from '@material-ui/core/MenuItem';
import ArrowRight from '@material-ui/icons/ArrowRight';
import clsx from 'clsx';

export interface NestedMenuItemProps extends Omit<MuiMenuItemProps, 'button'> {
  dataTestId?: string;
  parentMenuOpen: boolean;
  wrapperClassName?: string;
  component?: React.ElementType;
  label?: React.ReactNode;
  rightIcon?: React.ReactNode;
  ContainerProps?: React.HTMLAttributes<HTMLElement> &
    React.RefAttributes<HTMLElement | null>;
  MenuProps?: Omit<MuiMenuProps, 'children'>;
  button?: true | undefined;
}

const useMenuItemStyles = makeStyles((theme) => ({
  root: (props: {open: boolean}) => ({
    backgroundColor: props.open ? theme.palette.action.hover : 'transparent',
  }),
  disabled: {
    pointerEvents: 'none',
  },
  list: {
    padding: 0,
  },
}));

/**
 * Use as a drop-in replacement for `<MenuItem>` when you need to add cascading
 * menu elements as children to this component.
 */
const NestedMenuItem = forwardRef<
  HTMLLIElement | null,
  NestedMenuItemProps
>((props, ref) => {
  const {
    dataTestId,
    parentMenuOpen,
    label,
    rightIcon = <ArrowRight />,
    children,
    className,
    tabIndex: tabIndexProp,
    ContainerProps: ContainerPropsProp = {},
    wrapperClassName,
    ...MenuItemProps
  } = props;

  const { ref: containerRefProp, ...ContainerProps } = ContainerPropsProp;

  const menuItemRef = useRef<HTMLLIElement | null>(null);
  useImperativeHandle(ref, () => menuItemRef.current as HTMLLIElement);

  const containerRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(containerRefProp, () => containerRef.current);

  const menuContainerRef = useRef<HTMLDivElement>(null);

  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    setIsSubMenuOpen(true);

    if (ContainerProps?.onMouseEnter) {
      ContainerProps.onMouseEnter(event);
    }
  };
  const handleMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
    const activeElementIsMuiInput = document.activeElement?.className.includes('MuiInputBase-input');

    // if active element, the focus is child of the divref don't close
    if (!activeElementIsMuiInput) {
      setIsSubMenuOpen(false);
    }

    if (ContainerProps?.onMouseLeave) {
      ContainerProps.onMouseLeave(event);
    }
  };

  // Check if any immediate children are active
  const isSubmenuFocused = () => {
    const active = containerRef.current?.ownerDocument?.activeElement;
    // eslint-disable-next-line no-restricted-syntax
    for (const child of menuContainerRef.current?.children as unknown as [] ?? []) {
      if (child === active) {
        return true;
      }
    }
    return false;
  };

  const handleFocus = (event: React.FocusEvent<HTMLElement>) => {
    if (event.target === containerRef.current) {
      setIsSubMenuOpen(true);
    }

    if (ContainerProps?.onFocus) {
      ContainerProps.onFocus(event);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      return;
    }

    // stops the default material ui menu behaviour for navigation
    if (isSubmenuFocused()) {
      event.stopPropagation();
    }

    const active = containerRef.current?.ownerDocument?.activeElement;

    if (event.key === 'ArrowLeft' && isSubmenuFocused()) {
      containerRef.current?.focus();
    }

    if (
      event.key === 'ArrowRight'
      && event.target === containerRef.current
      && event.target === active
    ) {
      const firstChild = menuContainerRef.current?.children[0] as
        | HTMLElement
        | undefined;
      firstChild?.focus();
    }
  };

  const open = isSubMenuOpen && parentMenuOpen;
  const menuItemClasses = useMenuItemStyles({ open });

  // Root element must have a `tabIndex` attribute for keyboard navigation
  let tabIndex;
  if (!props.disabled) {
    tabIndex = tabIndexProp !== undefined ? tabIndexProp : -1;
  }

  return (
    <div
      {...ContainerProps}
      role="button"
      ref={containerRef}
      onFocus={handleFocus}
      tabIndex={tabIndex}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      className={clsx({
        [menuItemClasses.disabled]: MenuItemProps.disabled,
      })}
    >
      <MenuItem
        data-testid={dataTestId}
        {...MenuItemProps}
        className={clsx(menuItemClasses.root, className)}
        ref={menuItemRef}
      >
        {label}
        {rightIcon}
      </MenuItem>
      <Menu
        // Set pointer events to 'none' to prevent the invisible Popover div
        // from capturing events for clicks and hovers
        style={{ pointerEvents: 'none' }}
        anchorEl={menuItemRef.current}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        open={open}
        autoFocus={false}
        disableAutoFocus
        disableEnforceFocus
        onClose={() => {
          setIsSubMenuOpen(false);
        }}
        classes={
          {
            list: menuItemClasses.list,
          }
        }
      >
        <div
          role="none"
          className={wrapperClassName}
          ref={menuContainerRef}
          style={{ pointerEvents: 'auto' }}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </Menu>
    </div>
  );
});

export default NestedMenuItem;
