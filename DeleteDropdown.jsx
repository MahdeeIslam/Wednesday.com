import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

const DeleteDropdown = ({deleteAction}) => {
  return (
    <DropdownButton variant="danger" title="Delete" onSelect= {(eventKey, event)=>{deleteAction()}}>
      <Dropdown.Item >Confirm Delete</Dropdown.Item>
    </DropdownButton>
  );
}

export default DeleteDropdown;