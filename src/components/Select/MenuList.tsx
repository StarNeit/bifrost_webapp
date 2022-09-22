import { FixedSizeList } from 'react-window';
import { components } from 'react-select';
import { useTheme, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  listItem: {
    height: 'auto !important',
    '& > *': {
      whiteSpace: 'unset',
    },
  },
});

const MenuList: typeof components.MenuList = ({
  children,
  ...props
}) => {
  const itemSize = 40;
  const theme = useTheme();
  const classes = useStyles();
  const { selectProps } = props;
  const { enableVirtualization } = selectProps;

  if (enableVirtualization && children instanceof Array) {
    const itemCount = children.length || 0;

    const { getStyles } = props;
    const styles = getStyles('menuList', props);
    return (
      <FixedSizeList
        height={theme.spacing(31)}
        width="100%"
        itemCount={itemCount}
        itemSize={itemSize}
        style={{ ...styles }}
      >
        {({ index, style }) => (
          <div
            style={style}
            className={classes.listItem}
          >
            {children[index]}
          </div>
        )}
      </FixedSizeList>
    );
  }

  return (
    <components.MenuList {...props}>
      {children}
    </components.MenuList>
  );
};

export default MenuList;
