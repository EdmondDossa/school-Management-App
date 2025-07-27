import React from "react";

const BulletinRow = ({
  matiere,
  MI,
  MT,
  D1,
  D2,
  D3,
  rang,
  statistiques,
  appreciations,
}) => {
  const emptyNote = "**.**";
  return (
    <tr className="[&_td]:border [&_td]:text-sm [&_td]:border-black [&_td]:p-2 [&_td]:truncate [&_td:not(:first-child):not(:last-child)]:text-center ">
      <td> {matiere.NomMat} </td>
      <td> {matiere.Coef.toFixed(2)} </td>
      <td> {MI} </td>
      <td> {D1 ?? emptyNote} </td>
      <td> {D2 ?? emptyNote} </td>
      <td> {D3 ?? emptyNote} </td>
      <td className="font-bold"> {MT} </td>
      <td> {(+MT * +matiere.Coef).toFixed(2)} </td>
      <td> {rang} </td>
      <td> {statistiques["moyenneFaible"]} </td>
      <td> {statistiques["moyenneForte"]} </td>
      <td> {statistiques["moyenneSalle"]} </td>
      <td> { appreciations } </td>
    </tr>
  );
};

export default BulletinRow;
