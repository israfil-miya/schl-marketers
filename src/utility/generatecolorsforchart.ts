// Function to get year from the month name
const getYear = (monthName: string) => parseInt(monthName.split('_')[1]);

// Function to generate background colors based on year
const generateBackgroundColors = (
  data: { [key: string]: number },
  evenYearColor: string,
  oddYearColor: string,
) => {
  return Object.keys(data).map((monthName) => {
    const year = getYear(monthName);
    return year % 2 === 0 ? evenYearColor : oddYearColor;
  });
};

export default generateBackgroundColors;
