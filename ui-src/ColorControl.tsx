import Control, { ControlProps } from './Control';

const ColorControl = ({
  children,
  ...props
}: {
  small?: boolean;
} & ControlProps) => {
  const colorIcon = (
    <div style={{
      width: 24,
      height: 24,
      background: props.value as string,
      cursor: 'pointer'
    }} />
  );
  return (
    <Control
      {...props}
      icon={props.icon}
      as="input"
      type="color"
      replacement={
        <div className="c-control__input c-control__input--color">
          { props.icon 
            ? colorIcon
            : props.value 
          }
        </div>
      }
      right={
        props.icon
        ? props.right
        : colorIcon
      }
      rightReadOnly={false} />
  )
}

export default ColorControl;