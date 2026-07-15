export const MENU_TYPES = {
  MAIN: 'MAIN',
  SERVICE: 'SERVICE'
};

export const MENU_OPTIONS = {
  [MENU_TYPES.MAIN]: [
    { id: 'FEE_BALANCE', label: 'Fee Balance' },
    { id: 'ATTENDANCE', label: 'Attendance' },
    { id: 'RESULTS', label: 'Academic Results' },
    { id: 'DISCIPLINE', label: 'Discipline' },
    { id: 'SCHOOL_CALENDAR', label: 'School Calendar' },
    { id: 'ANNOUNCEMENTS', label: 'Announcements' },
    { id: 'SUPPORT_TICKET', label: 'Create Support Ticket' },
    { id: 'PHONE_UPDATE', label: 'Phone Number Update' },
    { id: 'LOGOUT', label: 'Logout' }
  ],
  [MENU_TYPES.SERVICE]: [
    { id: 'FEE_BALANCE', label: 'Fee Balance' },
    { id: 'ATTENDANCE', label: 'Attendance' },
    { id: 'RESULTS', label: 'Academic Results' },
    { id: 'DISCIPLINE', label: 'Discipline' },
    { id: 'SCHOOL_CALENDAR', label: 'School Calendar' },
    { id: 'ANNOUNCEMENTS', label: 'Announcements' },
    { id: 'SUPPORT_TICKET', label: 'Create Support Ticket' },
    { id: 'PHONE_UPDATE', label: 'Phone Number Update' },
    { id: 'LOGOUT', label: 'Logout' }
  ]
};

export class MenuBuilder {
  getMenu(menuType = MENU_TYPES.MAIN) {
    return MENU_OPTIONS[menuType] || [];
  }

  getOptionByIndex(menuType, index) {
    const menu = this.getMenu(menuType);
    const position = Number(index) - 1;
    return menu[position] || null;
  }

  getOptionById(menuType, id) {
    return this.getMenu(menuType).find((option) => option.id === id) || null;
  }

  getCommandFromInput(input, menuType = MENU_TYPES.MAIN) {
    const normalized = String(input || '').trim().toLowerCase();

    if (/^\d+$/.test(normalized)) {
      const option = this.getOptionByIndex(menuType, normalized);
      return option?.id || null;
    }

    const exactMatch = this.getMenu(menuType).find((option) => option.label.toLowerCase() === normalized);
    if (exactMatch) {
      return exactMatch.id;
    }

    return null;
  }
}
